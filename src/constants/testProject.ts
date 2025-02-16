export const configFieldsMap = {
  SELECT: ["workbook", "sheet", "range"],
  COPY_INTERNAL_SHEET: [
    "workbook",
    "sheet",
    "fromRange",
    "toRange",
    "skipBlanks",
  ],
  COPY_EXTERNAL_SHEET: [
    "workbook",
    "fromSheet",
    "toSheet",
    "fromRange",
    "toRange",
    "skipBlanks",
  ],
  COPY_WORKBOOK_SHEET: [
    "fromWorkbook",
    "toWorkbook",
    "fromSheet",
    "toSheet",
    "fromRange",
    "toRange",
    "skipBlanks",
  ],
  AUTO_FILL: ["workbook", "sheet", "fromRange", "toRange", "selectMultiItems"],
  GET_LAST_ROW_SHEET: ["workbook", "sheet", "targetCol"],
  BUILT_IN_VARIABLES: ["dateTime"],
  FORMAT_CELLS: ["workbook", "sheet", "range", "remove"],
  FILTER_NORMAL: [
    "workbook",
    "sheet",
    "range",
    "visibleItems",
    "selectMultiItems",
  ],
  FILTER_PIVOT_TABLE: [
    "workbook",
    "sheet",
    "range",
    "updateItems",
    "updateItem",
  ],
};

export const allFields = [
  "workbook",
  "sheet",
  "range",
  "fromRange",
  "toRange",
  "$fromRange",
  "$toRange",
  "skipBlanks",
  "fromSheet",
  "toSheet",
  "fromWorkbook",
  "toWorkbook",
  "selectMultiItems",
  "targetCol",
  "dateTime",
  "remove",
  "visibleItems",
  "updateItems",
  "updateItem",
];
