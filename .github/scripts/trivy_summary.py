import json
import os
import sys
from pathlib import Path


def main():
    # Summaryファイルの出力先を取得
    summary_path = os.environ.get(
        "GITHUB_STEP_SUMMARY", "summary.md"
    )

    # JSONファイルを読み込む
    try:
        with open("trivy.json") as f:
            data = json.load(f)
    except Exception as e:
        Path(summary_path).write_text(
            f"❌ Failed to read Trivy JSON: {e}"
        )
        sys.exit(1)

    # 脆弱性の抽出
    results = data.get("Results", [])
    vulns = [
        v
        for r in results
        for v in r.get("Vulnerabilities", [])
        if v["Severity"] in ("HIGH", "CRITICAL")
    ]

    # Markdown形式でのSummaryを作成
    if not vulns:
        summary = "✅ No CRITICAL or HIGH vulnerabilities found.\n"
    else:
        summary = f"🚨 Found {len(vulns)} CRITICAL/HIGH vulnerabilities\n\n"
        summary += "| Severity | Pkg | ID | Title |\n|---|---|---|---|\n"
        for v in vulns[:10]:
            summary += f"| {v['Severity']} | {v['PkgName']} | {v['VulnerabilityID']} | {v.get('Title', '').strip()} |\n"  # noqa: E501
        if len(vulns) > 10:
            summary += (
                f"\n... and {len(vulns) - 10} more.\n"
            )

    # SummaryをGITHUB_STEP_SUMMARYに書き込む
    Path(summary_path).write_text(
        "## 🔍 Trivy Scan Summary\n" + summary
    )

    # CRITICALまたはHIGHの脆弱性がある場合はエラーを出力
    if vulns:
        print(
            "::error::Trivy scan detected CRITICAL or HIGH vulnerabilities"
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
