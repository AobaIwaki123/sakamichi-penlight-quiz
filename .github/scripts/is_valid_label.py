import json
import os
import subprocess
import sys


def validate_pr_labels() -> bool:
    pr_number = os.environ.get("PR_NUMBER")
    # GitHub CLI用トークンを設定（環境変数から）
    gh_token = os.environ.get("GH_TOKEN")
    if not gh_token:
        print("GH_TOKEN is not set in environment")
        return False

    # gh CLI が GH_TOKEN を使えるように環境変数を設定
    env = os.environ.copy()
    env["GH_TOKEN"] = gh_token

    try:
        result = subprocess.run(
            [
                "gh",
                "pr",
                "view",
                str(pr_number),
                "--json",
                "labels",
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True,
            text=True,
            env=env,
        )
        data = json.loads(result.stdout)
        labels = [
            label["name"]
            for label in data.get("labels", [])
        ]
    except subprocess.CalledProcessError as e:
        print("Error running gh:", e.stderr)
        return False
    except json.JSONDecodeError:
        print("Invalid JSON response")
        return False

    # ラベルのカウント
    counts = {
        "major": labels.count("major"),
        "minor": labels.count("minor"),
        "patch": labels.count("patch"),
    }

    total_valid = sum(
        1 for count in counts.values() if count > 0
    )

    # バリデーションロジック
    if any(count > 1 for count in counts.values()):
        print("error: too many labels")
        return False

    if total_valid > 1:
        print("error: conflicting labels")
        return False

    if total_valid == 0:
        print("error: no valid labels")
        return False

    print("Valid labels found.")
    return True


# 実行例（環境変数 GH_TOKEN をセットしてから実行）
if __name__ == "__main__":
    result = validate_pr_labels()
    print("Result:", result)
    sys.exit(0 if result else 1)  # ← ここで終了コードを明示
