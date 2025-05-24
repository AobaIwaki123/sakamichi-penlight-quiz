import json
import os
import sys
from pathlib import Path

# 検出対象のSeverityレベルを環境変数から取得（デフォルト値付き）
TARGET_SEVERITIES = tuple(
    os.environ.get(
        "TRIVY_SEVERITIES", "HIGH,CRITICAL"
    ).split(",")
)


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
        if v["Severity"] in TARGET_SEVERITIES
    ]

    # Markdown形式でのSummaryを作成
    severity_text = "/".join(TARGET_SEVERITIES)
    if not vulns:
        summary = f"✅ No {severity_text} vulnerabilities found.\n"
    else:
        summary = f"🚨 Found {len(vulns)} {severity_text} vulnerabilities\n\n"
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
        error_severities = " or ".join(TARGET_SEVERITIES)
        print(
            f"::error::Trivy scan detected {error_severities} vulnerabilities"
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
