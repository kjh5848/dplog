TITLE_INPUT = [
    ".se-title-input",
    "[placeholder='제목']",
    ".se-placeholder",
    "div[contenteditable='true']",
]

POPUP = [
    ".se-popup",
    ".se-popup-alert",
]

HELP_CLOSE = [
    ".se-help-panel-close-button",
    "button[title*='도움말']",
]

BODY_CONTAINER = [
    ".se-main-container",
]

ALIGN_LEFT = [
    'button[data-name="align-left"]',
]

FILE_INPUT = [
    'input[type="file"][accept*="image"]',
    'input[type="file"][accept*="video"]',
    'input[type="file"]',
]

IMAGE_BUTTON = [
    'button[data-name="image"]',
    ".se-toolbar-item-image",
    ".se-image-toolbar-button",
    ".se-insert-menu-button-image",
    'button[title*="사진"]',
]

IMAGE_TYPE_POPUP = [
    '[data-name="se-popup-image-type"]',
    ".se-popup-image-type",
]

IMAGE_TYPE_COLLAGE = [
    'button:has-text("콜라주")',
    '[role="button"]:has-text("콜라주")',
    'label:has-text("콜라주")',
    ':text("콜라주")',
]

IMAGE_TYPE_SLIDE = [
    'button:has-text("슬라이드")',
    '[role="button"]:has-text("슬라이드")',
    'label:has-text("슬라이드")',
    ':text("슬라이드")',
]

IMAGE_TYPE_INDIVIDUAL = [
    'button:has-text("개별사진")',
    '[role="button"]:has-text("개별사진")',
    'label:has-text("개별사진")',
    ':text("개별사진")',
]

PARAGRAPH_BUTTON = [
    'button[data-name="text-format"]',
    ".se-text-format-toolbar-button",
    'button[data-name="paragraph"]',
    ".se-toolbar-item-paragraph",
    ".se-text-paragraph-button",
]

HEADING_MENU = {
    2: ['[data-value="heading2"]', 'button:has-text("제목")', ':text("제목")', ".se-item-heading2"],
    3: ['[data-value="heading3"]', 'button:has-text("소제목")', ':text("소제목")', ".se-item-heading3"],
}

QUOTE_BUTTON = [
    'button[data-name="quotation"]',
    ".se-toolbar-item-quotation",
    'button[title*="인용"]',
]

QUOTE_SELECT_BUTTON = [
    ".se-toolbar-item-insert-quotation .se-document-toolbar-select-option-button",
    'button.se-document-toolbar-select-option-button[data-name="quotation"]',
]

QUOTE_UNDERLINE_BUTTON = [
    ".se-toolbar-item-insert-quotation .se-insert-quotation-quotation_underline-toolbar-button",
    'button[data-name="quotation"][data-value="quotation_underline"]',
]

QUOTE_UNDERLINE_OPTION = [
    ".se-toolbar-option-insert-quotation-quotation_underline-button",
    'button[data-name="quotation"][data-value="quotation_underline"]',
    ".se-insert-menu-sub-panel-button-quotation-quotation_underline",
]

QUOTE_SECTION = [
    ".se-section-quotation",
    ".se-component.se-quotation",
    ".se-quotation",
]

QUOTE_BODY = [
    ".se-module.se-quote",
    ".se-quote",
    "blockquote",
]

QUOTE_CITE = [
    ".se-module.se-cite",
    ".se-cite",
]

COMPONENT_ADD = [
    ".se-component-add-button",
    'button[data-name="component-add"]',
    ".se-add-button",
]

HORIZONTAL_LINE = [
    'button[data-name="horizontal-line"]',
    ".se-insert-horizontal-line-default-toolbar",
    'button:has-text("구분선")',
    '[data-name="horizontalLine"]',
    ':text("구분선")',
]

PLACE_BUTTON = [
    'button[data-name="map"]',
    ".se-map-toolbar-button",
    'button:has-text("장소")',
    'button[data-name="place"]',
    ".se-toolbar-item-place",
    ".se-place-toolbar-button",
]

PLACE_SEARCH_INPUT = [
    ".react-autosuggest__input",
    "input[placeholder*='장소']",
    "input.search_input",
    ".se-place-search-input",
]

PLACE_RESULT_ITEM = [
    ".se-place-map-search-result-item",
    "li:has(.se-place-add-button)",
]

PLACE_ADD_BUTTON = [
    ".se-place-add-button",
    ".se-insert-place button:has-text('추가')",
    ".btn_add",
    ".place_add_btn",
]

PLACE_RESULT_LINK = [
    ".se-place-map-search-result-link",
]

PLACE_CONFIRM_BUTTON = [
    ".se-popup-button-confirm:not([disabled])",
    ".se-popup-button-confirm",
    "button:has-text('확인')",
    "button:has-text('완료')",
    ".btn_confirm",
]

PLACE_CLOSE_BUTTON = [
    ".se-popup-close-button",
    "button:has-text('팝업 닫기')",
]

PUBLISH_BUTTON = [
    "button:has-text('발행'):visible",
    "a:has-text('발행'):visible",
    ".btn_publish",
]

PROBE_BUTTONS = [
    "button",
    "a",
    "[data-name]",
    "[title]",
    "[contenteditable='true']",
]

EVIDENCE = {
    "title_candidates": TITLE_INPUT,
    "heading_candidates": [".se-section-title", ".se-section-subtitle", ".se-text-paragraph"],
    "quote_candidates": QUOTE_SECTION + QUOTE_BODY,
    "quote_cite_candidates": QUOTE_CITE,
    "bold_candidates": ["strong", "b", ".se-ff-nanumgothic.se-fs19.__se-node"],
    "underline_candidates": ["u", "span[style*='underline']"],
    "image_candidates": [".se-image", ".se-module-image", "img"],
    "contenteditable_candidates": ["[contenteditable='true']"],
}

REQUIRED_SELECTOR_GROUPS = {
    "title": TITLE_INPUT,
    "paragraph": PARAGRAPH_BUTTON,
    "heading": HEADING_MENU,
    "quote": QUOTE_BUTTON,
    "media": IMAGE_BUTTON,
    "publish": PUBLISH_BUTTON,
}
