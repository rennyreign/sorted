import os

from env import load_env_file


def test_load_env_file_sets_missing_values(tmp_path, monkeypatch):
    env_path = tmp_path / ".env"
    env_path.write_text(
        "\n".join(
            [
                "# local settings",
                "META_WHATSAPP_VERIFY_TOKEN='local-token'",
                'GITHUB_REPOSITORY="rennyreign/sorted"',
                "EMPTY_VALUE=",
            ]
        ),
        encoding="utf-8",
    )
    monkeypatch.delenv("META_WHATSAPP_VERIFY_TOKEN", raising=False)
    monkeypatch.delenv("GITHUB_REPOSITORY", raising=False)
    monkeypatch.delenv("EMPTY_VALUE", raising=False)

    loaded = load_env_file(env_path)

    assert loaded["META_WHATSAPP_VERIFY_TOKEN"] == "local-token"
    assert loaded["GITHUB_REPOSITORY"] == "rennyreign/sorted"
    assert loaded["EMPTY_VALUE"] == ""
    assert os.environ["META_WHATSAPP_VERIFY_TOKEN"] == "local-token"


def test_load_env_file_does_not_override_existing_values_by_default(tmp_path, monkeypatch):
    env_path = tmp_path / ".env"
    env_path.write_text("GITHUB_REPOSITORY=rennyreign/sorted\n", encoding="utf-8")
    monkeypatch.setenv("GITHUB_REPOSITORY", "already/set")

    loaded = load_env_file(env_path)

    assert loaded == {}
    assert os.environ["GITHUB_REPOSITORY"] == "already/set"

