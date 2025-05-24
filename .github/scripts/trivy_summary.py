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

    # 脆弱性レポートの生成（フルレポートとサマリーを1回のループで生成）
    severity_text = "/".join(TARGET_SEVERITIES)
    full_report_path = "trivy_full_report.md"

    if not vulns:
        summary = f"✅ No {severity_text} vulnerabilities found.\n"
        # 空のフルレポートも作成
        with open(full_report_path, "w") as f:
            f.write("## 📋 Full Trivy Report\n")
            f.write(
                f"✅ No {severity_text} vulnerabilities found.\n"
            )
    else:
        # サマリーのヘッダー部分を準備
        summary = f"🚨 Found {len(vulns)} {severity_text} vulnerabilities\n\n"
        summary += "| Severity | Pkg | ID | Title |\n|---|---|---|---|\n"

        # フルレポートファイルを開く
        with open(full_report_path, "w") as f:
            f.write("## 📋 Full Trivy Report\n")
            f.write(
                "| Severity | Pkg | ID | Title |\n|---|---|---|---|\n"
            )

            # 1回のループでフルレポートとサマリーの両方を生成
            for i, v in enumerate(vulns):
                vuln_line = (
                    f"| {v['Severity']} | {v['PkgName']} | "
                    f"{v['VulnerabilityID']} | "
                    f"{v.get('Title', '').strip()} |\n"
                )

                # フルレポートには全ての脆弱性を書き込み
                f.write(vuln_line)

                # サマリーには最初の10件のみ追加
                if i < 10:
                    summary += vuln_line

        # サマリーに残りの件数情報を追加
        if len(vulns) > 10:
            summary += (
                f"\n... and {len(vulns) - 10} more.\n"
            )
        summary += (
            "\n📎 FULL REPORT is available in the `Artifacts` "
            "section below.\n"
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
