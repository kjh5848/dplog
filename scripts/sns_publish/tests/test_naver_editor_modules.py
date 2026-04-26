from __future__ import annotations

import pathlib
import unittest

from scripts.sns_publish.naver_editor import selectors
from scripts.sns_publish.naver_editor.context import find_first_visible
from scripts.sns_publish.naver_editor.typing import parse_inline_tokens
from scripts.sns_publish.open_naver import build_arg_parser


class NaverEditorModuleTests(unittest.TestCase):
    def test_inline_token_parsing_preserves_order(self) -> None:
        self.assertEqual(
            parse_inline_tokens("일반 **볼드** 그리고 __밑줄__ 끝"),
            [
                ("text", "일반 "),
                ("bold", "볼드"),
                ("text", " 그리고 "),
                ("underline", "밑줄"),
                ("text", " 끝"),
            ],
        )

    def test_inline_token_parsing_keeps_incomplete_marker_as_text(self) -> None:
        self.assertEqual(
            parse_inline_tokens("문장 **미완성"),
            [("text", "문장 **미완성")],
        )

    def test_selector_registry_has_required_groups(self) -> None:
        for key in ("title", "paragraph", "heading", "quote", "media", "publish"):
            self.assertIn(key, selectors.REQUIRED_SELECTOR_GROUPS)
            self.assertTrue(selectors.REQUIRED_SELECTOR_GROUPS[key])

    def test_cli_defaults_to_draft_only(self) -> None:
        args = build_arg_parser().parse_args([])

        self.assertFalse(args.publish)
        self.assertTrue(args.draft_only)
        self.assertEqual(args.keep_open_seconds, 600)

    def test_find_first_visible_public_contract_returns_locator_only(self) -> None:
        self.assertTrue(callable(find_first_visible))

    def test_open_naver_keeps_smart_editor_selectors_out_of_orchestrator(self) -> None:
        open_naver_path = pathlib.Path(__file__).parents[1] / "open_naver.py"
        source = open_naver_path.read_text(encoding="utf-8")

        forbidden_fragments = [
            ".se-toolbar-item-",
            "button[data-name=",
            'input[type="file"]',
            ".se-main-container",
            ".btn_publish",
            "[placeholder='제목']",
            "[contenteditable='true']",
        ]

        for fragment in forbidden_fragments:
            with self.subTest(fragment=fragment):
                self.assertNotIn(fragment, source)


if __name__ == "__main__":
    unittest.main()
