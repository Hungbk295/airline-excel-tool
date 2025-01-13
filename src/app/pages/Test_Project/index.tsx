import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Form,
  Upload,
  Typography,
  Switch,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { log } from "console";
const { Option } = Select;
const { Text } = Typography;

const configFieldsMap = {
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
    "fromRange" || "$fromRange",
    "toRange" || "$toFromRange",
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

const allFields = [
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

const TestProject = () => {
  const [stages, setStages] = useState<any>([
    {
      key: 1,
      step: 1,
      name: "",
      type: "",
      artifactKey: { inputArtifact: "", outputArtifact: "" },
      config: {},
    },
  ]);

  const [editingKey, setEditingKey] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [savedConfigs, setSavedConfigs] = useState({});
  const [listOutputArtifact, setListOutputArtifact] = useState([]);

  const handleConfigName = (type) => {
    if (configFieldsMap[type]) {
      const fields = configFieldsMap[type];
      const prefix = type.split("_")[0].toLowerCase();

      return { name: prefix, fields };
    }

    return null;
  };

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === "string") {
          const jsonData = JSON.parse(result);
          if (Array.isArray(jsonData.stages)) {
            const formattedStages = jsonData.stages.map((stage, index) => ({
              key: Date.now() + index,
              step: index + 1,
              name: stage.name || handleConfigName(stage.type),
              type: stage.type || "",
              config: Object.keys(stage.config || {}).reduce((acc, key) => {
                if (key === "skipBlanks") {
                  acc[key] =
                    typeof stage.config[key] === "string"
                      ? stage.config[key]
                      : String(stage.config[key] ?? "");
                } else if (key.startsWith("$")) {
                  const baseKey = key.slice(1);
                  acc[key] = stage.config[key];
                  acc[`data${key}`] = stage.config[key];

                  delete acc[baseKey];
                } else if (!stage.config[`$${key}`]) {
                  acc[key] = stage.config[key];
                }
                return acc;
              }, {}),
              artifactKey: stage.artifactKey || "",
            }));
            console.log(formattedStages);

            setStages(formattedStages);
            setEditingKey(null);
          } else {
            console.error('Invalid JSON structure: Missing "stages" array');
          }
        } else {
          console.error("File content is not a valid string");
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };
    reader.readAsText(file);
    return false;
  };

  const handleNewStage = () => {
    setStages([
      {
        key: 1,
        step: 1,
        name: " ",
        type: "",
        artifactKey: { inputArtifact: "", outputArtifact: " " },
        config: "",
      },
    ]);
    setEditingKey(1);
  };

  const handleAddStage = (index) => {
    if (editingKey !== null) return;
    const newStage = {
      key: index,
      step: index + 0.5,
      name: "",
      type: "",
      artifactKey: { inputArtifact: "", outputArtifact: "" },
      config: "",
    };

    const updatedStages = [...stages];
    updatedStages.splice(index, 0, newStage);

    const updatedStagesWithSteps = updatedStages.map((stage, idx) => ({
      ...stage,
      step: idx + 1,
    }));

    setStages(updatedStagesWithSteps);
    setEditingKey(newStage.key);
  };

  const handleUpdateStage = (key, field, value) => {
    setStages((prevStages) =>
      prevStages.map((stage) => {
        if (stage.key === key) {
          if (field === "type") {
            setSavedConfigs((prevConfigs) => ({
              ...prevConfigs,
              [key]: {
                ...(prevConfigs[key] || {}),
                [stage.type]: stage.config,
              },
            }));

            const restoredConfig = savedConfigs[key]?.[value] || {};

            return { ...stage, [field]: value, config: restoredConfig };
          }

          if (field === "config") {
            const newConfig = {
              ...(typeof stage.config === "object" && stage.config
                ? stage.config
                : {}),
              ...(typeof value === "object" && value ? value : {}),
            };
            console.log(newConfig);

            return { ...stage, config: newConfig };
          }

          if (field === "artifactKey") {
            return {
              ...stage,
              artifactKey: {
                ...stage.artifactKey,
                ...value,
              },
            };
          }

          return { ...stage, [field]: value };
        }
        return stage;
      })
    );
  };

  const isEditing = (key) => editingKey === key;

  const handleEdit = (key) => {
    if (key !== editingKey) {
      const currentStage = stages.find((stage) => stage.key === key);
      setOriginalData({ ...currentStage });
      setEditingKey(key);
    }
  };

  const handleSave = (record) => {
    if (record) {
      handleOutputArtifact(record);
    }

    if (editingKey !== null) {
      setEditingKey(null);
      setOriginalData(null);
      setSavedConfigs({});
    }
  };

  const handleCancel = () => {
    if (editingKey !== null) {
      const isNewStageEmpty = stages.some(
        (stage) => stage.key === editingKey && !stage.type && !stage.config
      );

      if (isNewStageEmpty) {
        handleDeleteStage(editingKey);
      } else if (originalData) {
        const updatedStages = stages.map((stage) =>
          stage.key === editingKey ? originalData : stage
        );
        setStages(updatedStages);
      }

      setEditingKey(null);
      setOriginalData(null);
      setSavedConfigs({});
    }
  };

  const handleDeleteStage = (key) => {
    setStages((prevStages) => {
      const editingStage = prevStages.find((stage) => stage.key === key);
      const editingStep = editingStage ? editingStage.step : null;

      return prevStages
        .filter((stage) => stage.key !== key)
        .map((stage) => ({
          ...stage,
          step: stage.step > editingStep ? stage.step - 1 : stage.step,
        }));
    });
  };

  const handleInputArtifact = (record) => {
    const ranges = ["fromRange", "toRange"];
    const suffixes = ["from", "fromIndex", "to", "toIndex"];
    const dataList = {};

    for (const range of ranges) {
      for (const suffix of suffixes) {
        const key = `${range}_${suffix}`;
        dataList[key] = record.config[key] || "";
      }
    }

    const createRender = (range, type) => {
      const from = dataList[`${range}_from`];
      const fromIndex = dataList[`${range}_fromIndex`];
      const to = dataList[`${range}_to`];
      const toIndex = dataList[`${range}_toIndex`];

      if (type == "range") {
        const fromPart =
          from && fromIndex ? `${from}:${fromIndex}` : from || fromIndex;
        const toPart = to && toIndex ? `${to}:${toIndex}` : to || toIndex;

        return fromPart && toPart
          ? `${fromPart} : ${toPart}`
          : fromPart || toPart;
      }
      if (type === "data") {
        const fromOutput = fromIndex
          ? `${from}{inputArtifact[${fromIndex}][${record.artifactKey?.outputArtifact || ""}] + 1}`
          : "";
        const toOutput = toIndex
          ? `: ${to}{inputArtifact[${toIndex}][${record.artifactKey?.outputArtifact || ""}]}`
          : "";

        return `${fromOutput} ${toOutput}`;
      }
    };

    const $fromRenderRange = createRender("fromRange", "range");
    const $toRenderRange = createRender("toRange", "range");
    const $fromRenderData = createRender("fromRange", "data");
    const $toRenderData = createRender("toRange", "data");

    const exportInput = [$fromRenderRange, $toRenderRange]
      .filter(Boolean)
      .join(" : ");

    setStages((prevStages) =>
      prevStages.map((stage) =>
        stage.key === record.key
          ? {
              ...stage,
              config: {
                ...stage.config,
                formRange: $fromRenderRange,
                data$fromRange: {
                  indexFrom: dataList["fromRange_fromIndex"],
                  indexTo: dataList["fromRange_toIndex"],
                  render: $fromRenderData,
                },
                toFormRange: $toRenderRange,
                data$toRange: {
                  indexFrom: dataList["toRange_fromIndex"],
                  indexTo: dataList["toRange_toIndex"],
                  render: $toRenderData,
                },
              },
              artifactKey: {
                ...stage.artifactKey,
                inputArtifact: exportInput,
              },
            }
          : stage
      )
    );
  };

  const handleOutputArtifact = (record) => {
    const output = record.artifactKey.outputArtifact;
    if (output) {
      const parts = output.includes(",")
        ? output.split(",").map((part) => part.trim())
        : [output.trim()];

      setListOutputArtifact((prevList) => {
        const updatedList = [...prevList];
        parts.forEach((part) => {
          if (!updatedList.includes(part)) {
            updatedList.push(part);
          }
        });
        return updatedList;
      });
    }
  };

  const handleExport = (input: any) => {
    let data;

    if (typeof input === "string") {
      try {
        data = JSON.parse(input);
      } catch (error) {
        console.error("Invalid JSON string:", error);
        return;
      }
    } else if (Array.isArray(input)) {
      data = input;
    } else if (typeof input === "object" && input !== null) {
      data = [input];
    } else {
      console.error("Invalid input: Must be a JSON string, object, or array.");
      return;
    }

    console.log(data);

    const formattedStages = data.map((stage: any) => {
      const name =
        typeof stage.name === "object" && stage.name !== null
          ? stage.name.name
          : stage.name || "";

      const type = stage.type || "";
      let config = stage.config
        ? Object.fromEntries(
            Object.entries(stage.config).filter(([key]) =>
              allFields.includes(key)
            )
          )
        : undefined;

      ["$toRange", "$fromRange"].forEach((key) => {
        if (stage.config?.[key] !== false) {
          config = { ...config, [key]: stage.config?.[`data${key}`] };
        }
      });

      const { inputArtifact, outputArtifact } = stage.artifactKey || {};

      const filteredArtifacts = {
        ...(inputArtifact ? { inputArtifact } : {}),
        ...(outputArtifact ? { outputArtifact } : {}),
      };

      return {
        ...(name && { name }),
        ...(type && { type }),
        ...(config && { config }),
        ...filteredArtifacts,
      };
    });

    const pipeline = {
      stages: formattedStages,
    };

    const jsonContent = JSON.stringify(pipeline, null, 4);

    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "pipeline.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "15%",
      render: (_, record) => {
        const groupedFields = handleConfigName(record.type);
        return (
          <Text>{record.name != "" ? record.name : groupedFields?.name}</Text>
        );
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: "20%",
      render: (text, record) =>
        isEditing(record.key) ? (
          <Select
            value={text}
            onChange={(value) => handleUpdateStage(record.key, "type", value)}
            placeholder="Select type"
            style={{ width: "100%" }}
          >
            {Object.keys(configFieldsMap).map((type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
        ) : (
          <span>{text}</span>
        ),
    },
    {
      title: "Config",
      dataIndex: "config",
      key: "config",
      width: "25%",
      render: (_, record) =>
        isEditing(record.key) ? (
          <Form layout="vertical">
            {configFieldsMap[record.type]?.map((field) => (
              <Form.Item
                label={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>
                      {record.config?.[`$${field}`] ? `$${field}` : field}
                    </span>
                    {["fromRange", "toRange"].includes(field) && (
                      <Switch
                        size="small"
                        style={{ cursor: "pointer" }}
                        checked={record.config?.[`$${field}`] || false}
                        onClick={() => {
                          handleOutputArtifact(record);
                          handleUpdateStage(record.key, "config", {
                            ...record.config,
                            [`$${field}`]: !record.config?.[`$${field}`],
                          });
                        }}
                      />
                    )}
                  </div>
                }
                key={field}
              >
                {field === "updateItems" ? (
                  <div>
                    {record.config?.updateItems?.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "4px 0",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        <div>
                          <strong>Name:</strong>
                          <Input
                            value={item.name}
                            onChange={(e) => {
                              const updatedItems = [
                                ...record.config.updateItems,
                              ];
                              updatedItems[index] = {
                                ...item,
                                name: e.target.value,
                              };

                              handleUpdateStage(record.key, "config", {
                                ...record.config,
                                updateItems: updatedItems,
                              });
                            }}
                            style={{ width: "40%" }}
                          />
                        </div>
                        <div>
                          <strong>Visible:</strong>
                          <Input
                            value={item.visible ? "true" : "false"}
                            onChange={(e) => {
                              const updatedItems = [
                                ...record.config.updateItems,
                              ];
                              updatedItems[index] = {
                                ...item,
                                visible: e.target.value === "true",
                              };

                              handleUpdateStage(record.key, "config", {
                                ...record.config,
                                updateItems: updatedItems,
                              });
                            }}
                            style={{ width: "40%" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : record.config?.[`$${field}`] ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <Text strong>{"from"}</Text>
                      <Input
                        placeholder="Enter Column"
                        value={record.config?.[`${field}_from`] || ""}
                        onChange={(e) => {
                          handleUpdateStage(record.key, "config", {
                            ...record.config,
                            [`${field}_from`]: e.target.value,
                          });
                        }}
                        style={{ width: "40%" }}
                      />
                      <Text strong style={{ display: "flex" }}>
                        index
                      </Text>
                      <Select
                        placeholder="Select Row"
                        style={{ width: "40%" }}
                        defaultValue={
                          record.config?.[`data$${field}`]?.indexFrom
                        }
                        onChange={(value) => {
                          const updatedConfig = {
                            ...record.config,
                            [`${field}_fromIndex`]: value,
                          };

                          handleUpdateStage(
                            record.key,
                            "config",
                            updatedConfig
                          );

                          handleInputArtifact({
                            ...record,
                            config: updatedConfig,
                          });
                        }}
                      >
                        {listOutputArtifact.map((option, index) => (
                          <Select.Option key={index} value={option}>
                            {option.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <Text strong>{"To"}</Text>
                      <Input
                        placeholder="Enter Column"
                        value={record.config?.[`${field}_to`] || ""}
                        onChange={(e) =>
                          handleUpdateStage(record.key, "config", {
                            ...record.config,
                            [`${field}_to`]: e.target.value,
                          })
                        }
                        style={{ width: "40%" }}
                      />
                      <Text strong style={{ display: "flex" }}>
                        index
                      </Text>
                      <Select
                        placeholder="Select Row"
                        style={{ width: "40%" }}
                        defaultValue={record.config?.[`data$${field}`]?.indexTo}
                        onChange={(value) => {
                          const updatedConfig = {
                            ...record.config,
                            [`${field}_toIndex`]: value,
                          };

                          handleUpdateStage(
                            record.key,
                            "config",
                            updatedConfig
                          );

                          handleInputArtifact({
                            ...record,
                            config: updatedConfig,
                          });
                        }}
                      >
                        {listOutputArtifact.map((option, index) => (
                          <Select.Option key={index} value={option}>
                            {option.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>
                    <Input
                      placeholder={`Input for $${field}`}
                      value={
                        record.config?.[`data$${field}`]?.render ||
                        record.config?.[`data$${field}`]
                      }
                    />
                  </div>
                ) : (
                  <Input
                    value={record.config?.[field] || ""}
                    onChange={(e) =>
                      handleUpdateStage(record.key, "config", {
                        ...record.config,
                        [field]: e.target.value,
                      })
                    }
                    placeholder={`Enter ${field}`}
                  />
                )}
              </Form.Item>
            ))}
          </Form>
        ) : (
          <div>
            {configFieldsMap[record.type]?.map((field) => (
              <div
                key={field}
                className="config-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "4px ",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <strong style={{ width: "50%" }}>
                  {record.config?.[`$${field}`] ? `$${field}` : field}:
                </strong>
                {field === "updateItems" ? (
                  <div>
                    {record.config?.updateItems?.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "10px",
                        }}
                      >
                        <span style={{ width: "50%" }}>
                          <strong style={{ width: "50%" }}>Name:</strong>
                          {item.name}
                        </span>
                        <span>
                          <strong style={{ width: "50%" }}>Visible:</strong>
                          {item.visible ? "true" : "false"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : record.config?.[`$${field}`] ? (
                  record.config?.[`$${field}`] || ""
                ) : (
                  record.config?.[field] || ""
                )}
              </div>
            ))}
          </div>
        ),
    },
    {
      title: "ArtifactKey",
      key: "ArtifactKey",
      width: "20%",
      render: (_, record) =>
        isEditing(record.key) ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Text strong>Input Artifact:</Text>
              <Text>{record.artifactKey.inputArtifact || ""}</Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Text strong>Output Artifact:</Text>
              <Input
                placeholder="Enter output artifact"
                value={record.artifactKey?.outputArtifact}
                onChange={(e) =>
                  handleUpdateStage(record.key, "artifactKey", {
                    ...record.artifactKey,
                    outputArtifact: e.target.value,
                  })
                }
                style={{ width: "70%" }}
              />
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Text strong>Input Artifact:</Text>
              <Text>{record.artifactKey?.inputArtifact}</Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Text strong>Output Artifact:</Text>
              <Text>{record.artifactKey?.outputArtifact || ""}</Text>
            </div>
          </div>
        ),
    },
    {
      title: "Modify",
      key: "modify",
      width: "20%",
      render: (_, record) =>
        isEditing(record.key) ? (
          <>
            <Button
              type="primary"
              onClick={() => handleSave(record)}
              style={{ marginRight: 8 }}
            >
              Save
            </Button>
            <Button onClick={handleCancel}>Cancel</Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => handleEdit(record.key)}
              style={{ marginRight: 8 }}
              disabled={editingKey !== null}
            >
              Edit
            </Button>
            <Button
              danger
              onClick={() => handleDeleteStage(record.key)}
              style={{ marginRight: 8 }}
              disabled={editingKey !== null}
            >
              Delete
            </Button>
            <Button
              onClick={() => handleAddStage(record.step)}
              disabled={editingKey !== null}
              style={{ marginRight: 8 }}
            >
              Add Step
            </Button>
            <Button
              onClick={() => handleExport(record)}
              disabled={editingKey !== null}
              style={{ marginRight: 8 }}
            >
              Export To Json
            </Button>
          </>
        ),
    },
  ];

  useEffect(() => {
    if (listOutputArtifact && listOutputArtifact.length > 0) {
    }
  }, [listOutputArtifact]);

  return (
    <div className="m-5">
      <div className="mb-4">
        <Upload
          accept=".json"
          beforeUpload={handleUpload}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />} style={{ marginRight: 8 }}>
            Click to Upload
          </Button>
        </Upload>

        <Button
          type="primary"
          onClick={handleNewStage}
          style={{ marginRight: 8 }}
        >
          Add New Stage
        </Button>

        <Button
          onClick={() => handleExport(stages)}
          disabled={editingKey !== null}
          style={{ marginRight: 8 }}
        >
          Export To Json
        </Button>
      </div>
      <Table
        dataSource={stages}
        columns={columns}
        rowKey="key"
        bordered
        pagination={false}
      />
    </div>
  );
};

export default TestProject;
