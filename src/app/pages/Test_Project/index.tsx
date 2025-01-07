import React, { useState } from "react";
import { Table, Button, Input, Select, Form, Upload, Typography } from "antd";
import { QuestionCircleTwoTone, UploadOutlined } from "@ant-design/icons";
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

const TestProject = () => {
  const [stages, setStages] = useState([
    { key: 1, step: 1, name: "", action: "", config: "" },
  ]);
  const [editingKey, setEditingKey] = useState(null);

  const handleConfigName = (action) => {
    if (configFieldsMap[action]) {
      const fields = configFieldsMap[action];
      const prefix = action.split("_")[0].toLowerCase();

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
              action: stage.type || "",
              config: stage.config || "",
            }));
            setStages(formattedStages);
            setEditingKey(formattedStages[0]?.key || null);
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
    setStages([{ key: 1, step: 1, name: " ", action: "", config: "" }]);
    setEditingKey(1);
  };

  const handleAddStage = (index) => {
    if (editingKey !== null) return;
    const newStage = {
      key: index,
      step: index + 0.5,
      name: "",
      action: "",
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
          if (field === "config") {
            const newConfig = {
              ...(typeof stage.config === "object" && stage.config
                ? stage.config
                : {}),
              ...(typeof value === "object" && value ? value : {}),
            };
            return { ...stage, config: newConfig };
          }
          return { ...stage, [field]: value };
        }
        return stage;
      })
    );
  };

  const isEditing = (key) => editingKey === key;

  const handleEdit = (key) => {
    console.log(key);

    setEditingKey(key);
  };

  const handleSave = (data) => {
    setEditingKey(null);
  };

  const handleCancel = () => {
    const isNewStageEmpty = stages.some(
      (stage) => stage.key === editingKey && !stage.action && !stage.config
    );

    if (isNewStageEmpty) {
      handleDeleteStage(editingKey);
    }

    setEditingKey(null);
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

    const formattedStages = data.map((stage: any) => ({
      name: stage.name || "",
      type: stage.action || "",
      config: {
        ...stage.config,
      },
    }));

    const pipeline = {
      stages: formattedStages,
    };

    console.log(stages.map);
    const jsonContent = JSON.stringify(pipeline, null, 4);

    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "pipeline.json";
    link.click();
    URL.revokeObjectURL(url);

    console.log("Exported JSON:", jsonContent);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => {
        const groupedFields = handleConfigName(record.action);
        return <Text>{groupedFields?.name || record.name}</Text>;
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (text, record) =>
        isEditing(record.key) ? (
          <Select
            value={text}
            onChange={(value) => handleUpdateStage(record.key, "action", value)}
            placeholder="Select action"
            style={{ width: "100%" }}
          >
            {Object.keys(configFieldsMap).map((action) => (
              <Option key={action} value={action}>
                {action}
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
      render: (_, record) =>
        isEditing(record.key) ? (
          <Form layout="vertical">
            {configFieldsMap[record.action]?.map((field) => (
              <Form.Item label={field} key={field}>
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
              </Form.Item>
            ))}
          </Form>
        ) : (
          <div>
            {configFieldsMap[record.action]?.map((field) => (
              <div key={field} className="config-item">
                <strong>{field}:</strong>{" "}
                {typeof record.config?.[field] === "object"
                  ? JSON.stringify(record.config[field])
                  : (record.config?.[field] ?? "")}
              </div>
            ))}
          </div>
        ),
    },
    {
      title: "OutputArtifactKey",
      key: "outputArtifactKey",
      render: (_, record) =>
        isEditing(record.key) ? (
          <>
            <Button
              type="primary"
              onClick={handleSave}
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

  return (
    <div className="m-5">
      <div className="mb-4">
        <Button
          type="primary"
          onClick={handleNewStage}
          style={{ marginBottom: 16 }}
        >
          Add New Stage
        </Button>
        <Upload
          accept=".json"
          beforeUpload={handleUpload}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
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
