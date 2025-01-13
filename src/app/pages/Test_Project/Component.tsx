import { useEffect } from "react";
import {
  Table,
  Button,
  Upload,
  Form,
  Select,
  Input,
  Switch,
  Typography,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
const { Option } = Select;
const { Text } = Typography;

const TableComponent = ({
  stages,
  editingKey,
  configFieldsMap,
  listOutputArtifact,
  handleNewStage,
  handleAddStage,
  handleUpdateStage,
  handleDeleteStage,
  handleEdit,
  handleSave,
  handleCancel,
  handleUpload,
  handleExport,
  handleConfigName,
  handleInputArtifact,
  handleOutputArtifact,
}) => {
  useEffect(() => {
    if (listOutputArtifact && listOutputArtifact.length > 0) {
    }
  }, [listOutputArtifact]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "10%",
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
        editingKey == record.key ? (
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
      width: "35%",
      render: (_, record) =>
        editingKey == record.key ? (
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
                        record.config?.[`data$${field}`]?.indexFrom ||
                        record.config?.[`data$${field}`]?.indexTo
                          ? record.config?.[`data$${field}`]?.render
                          : record.config?.[`$${field}`] &&
                              record.config?.[`$${field}`] !== true
                            ? record.config?.[`$${field}`]
                            : ""
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
                  alignItems: "left",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <strong style={{ flexBasis: "30%", textAlign: "left" }}>
                  {record.config?.[`$${field}`] ? `$${field}` : field}:
                </strong>
                {field === "updateItems" ? (
                  <div style={{ flexBasis: "70%" }}>
                    {record.config?.updateItems?.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "5px",
                          padding: "2px 0",
                        }}
                      >
                        <span style={{ flexBasis: "45%", textAlign: "left" }}>
                          <strong>Name:</strong> {item.name}
                        </span>
                        <span style={{ flexBasis: "45%", textAlign: "left" }}>
                          <strong>Visible:</strong>{" "}
                          {item.visible ? "true" : "false"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : record.config?.[`$${field}`] ? (
                  <div style={{ flexBasis: "70%", textAlign: "left" }}>
                    {record.config?.[`data$${field}`]?.render ||
                      record.config?.[`data$${field}`]}
                  </div>
                ) : (
                  <div style={{ flexBasis: "70%", textAlign: "left" }}>
                    {record.config?.[field] || ""}
                  </div>
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
        editingKey == record.key ? (
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
        editingKey == record.key ? (
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
          </>
        ),
    },
  ];

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

export default TableComponent;
