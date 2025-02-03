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
import {
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
const { Option } = Select;
const { Text } = Typography;

interface ResourceData {
  xlsx?: {
    [key: string]: string;
  };
}
interface IProps {
  stages: any[];
  resources: ResourceData;
  editingKey: string;
  configFieldsMap: { [key: string]: any };
  listOutputArtifact: any[];
  handleUpdateResources: (resources: ResourceData) => void;
  handleNewStage: () => void;
  handleAddStage: (index) => void;
  handleUpdateStage: (key, field, value) => void;
  handleDeleteStage: (key) => void;
  handleEdit: (key) => void;
  handleSave: (record) => void;
  handleCancel: () => void;
  handleUpload: (file: File) => boolean;
  handleExport: (input) => void;
  handleConfigName: (type) => { name; fields };
  handleInputRange: (record) => void;
  handleOutputArtifact: (record) => void;
}

function TableComponent(props: IProps) {
  useEffect(() => {}, [props.listOutputArtifact]);

  const {
    stages,
    resources,
    editingKey,
    configFieldsMap,
    listOutputArtifact,
    handleUpdateResources,
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
    handleInputRange,
    handleOutputArtifact,
  } = props;

  const [form] = Form.useForm();

  useEffect(() => {
    if (resources) {
      form.setFieldsValue({
        xlsx: resources.xlsx ? Object.values(resources.xlsx) : [""],
      });
    }
  }, [resources, form]);

  const columns = [
    {
      title: "Step",
      dataIndex: "Step",
      key: "Step",
      width: "10%",
      render: (_, record) => {
        return editingKey === record.key ? (
          <Text>{record.key}</Text>
        ) : (
          <span>{record.key}</span>
        );
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "10%",
      render: (_, record) => {
        return editingKey === record.key ? (
          <Input
            value={
              record.name != ""
                ? record.name
                : handleConfigName(record.type)?.name
            }
            onChange={(e) =>
              handleUpdateStage(record.key, "name", e.target.value)
            }
          />
        ) : (
          <span>{record.name}</span>
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
                    {["fromRange", "toRange", "range"].includes(field) && (
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
                    <Input
                      placeholder="Enter Items"
                      defaultValue={
                        record.config.updateItems?.length
                          ? record.config.updateItems
                              .map((item) => `${item.name} | ${item.visible}`)
                              .join(" | ")
                          : ""
                      }
                      onChange={(e) => {
                        const input = e.target.value;
                        const splitItems = input.split("|");
                        const updatedItems = [];

                        for (let i = 0; i < splitItems.length; i += 2) {
                          const name = splitItems[i]?.trim();
                          const visible = splitItems[i + 1]?.trim();
                          if (name && visible !== undefined) {
                            updatedItems.push({
                              name,
                              visible,
                            });
                          }
                        }

                        handleUpdateStage(record.key, "config", {
                          ...record.config,
                          updateItems: updatedItems,
                        });
                      }}
                      style={{ width: "100%" }}
                    />
                  </div>
                ) : record.config?.[`$${field}`] ? (
                  field != "range" ? (
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
                        <Text style={{ width: "5%" }} strong>
                          {"from"}
                        </Text>
                        <Input
                          placeholder="Enter Column"
                          value={record.config?.[`${field}_from`] || ""}
                          onChange={(e) => {
                            handleUpdateStage(record.key, "config", {
                              ...record.config,
                              [`${field}_from`]: e.target.value,
                            });
                            handleInputRange(record);
                          }}
                          style={{ width: "10%", flex: 1 }}
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
                          onClick={() => handleOutputArtifact(record)}
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

                            handleInputRange({
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
                        <Text style={{ width: "5%" }} strong>
                          {"To"}
                        </Text>
                        <Input
                          placeholder="Enter Column"
                          value={record.config?.[`${field}_to`] || ""}
                          onClick={handleInputRange}
                          onChange={(e) => {
                            handleUpdateStage(record.key, "config", {
                              ...record.config,
                              [`${field}_to`]: e.target.value,
                            });
                            handleInputRange(record);
                          }}
                          style={{ width: "50%", flex: 1 }}
                        />
                        <Text strong style={{ display: "flex" }}>
                          index
                        </Text>
                        <Select
                          placeholder="Select Row"
                          style={{ width: "40%" }}
                          onClick={() => handleOutputArtifact(record)}
                          defaultValue={
                            record.config?.[`data$${field}`]?.indexTo
                          }
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

                            handleInputRange({
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
                        value={record.config?.[`data$${field}`] || ""}
                      />
                    </div>
                  ) : (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >
                        <Input
                          placeholder={`Input for $${field}`}
                          value={record.config?.[`$${field}`] || ""}
                          onChange={(e) => {
                            handleUpdateStage(record.key, "config", {
                              ...record.config,
                              [`$${field}`]: e.target.value,
                            });
                          }}
                          style={{ width: "30%" }}
                        />
                        <Select
                          placeholder="Select Range Start"
                          style={{ width: "30%" }}
                          value={record.config?.[`${field}_start`] || ""}
                          onChange={(value) => {
                            handleUpdateStage(record.key, "config", {
                              ...record.config,
                              [`${field}_start`]: value,
                            });
                          }}
                        >
                          {listOutputArtifact.map((option, index) => (
                            <Select.Option key={index} value={option}>
                              {option.label}
                            </Select.Option>
                          ))}
                        </Select>
                        <Select
                          placeholder="Select Range End"
                          style={{ width: "30%" }}
                          value={record.config?.[`${field}_end`] || ""}
                          onChange={(value) => {
                            handleUpdateStage(record.key, "config", {
                              ...record.config,
                              [`${field}_end`]: value,
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
                    </div>
                  )
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
                          <strong>Visible:</strong> {item.visible.toString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : record.config?.[`$${field}`] ? (
                  <div style={{ flexBasis: "70%", textAlign: "left" }}>
                    {record.config?.[`data$${field}`] || ""}
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
              <Select
                placeholder="Select Row"
                style={{ width: "40%" }}
                mode={"multiple"}
                defaultValue={
                  record.artifactKey?.inputArtifact
                    ? Array.from(new Set(record.artifactKey.inputArtifact))
                    : []
                }
                onClick={() => handleOutputArtifact(record)}
                allowClear={
                  record.artifactKey?.inputArtifact == "" ||
                  !!record.artifactKey?.inputArtifact
                }
                onChange={(value) => {
                  handleUpdateStage(record.key, "artifactKey", {
                    ...record.artifactKey,
                    inputArtifact: value,
                  });
                }}
              >
                {listOutputArtifact.map((option, index) => (
                  <Select.Option key={index} value={option}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>{" "}
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
              <Text>
                {Array.isArray(record.artifactKey?.inputArtifact)
                  ? record.artifactKey.inputArtifact.join(", ")
                  : record.artifactKey?.inputArtifact}
              </Text>{" "}
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
              onClick={() => handleAddStage(record.key)}
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
          Create New
        </Button>
        <Button
          onClick={() => handleExport(stages)}
          disabled={editingKey !== null}
          style={{ marginRight: 8 }}
        >
          Export To Json
        </Button>
      </div>
      <Form
        form={form}
        initialValues={{
          xlsx: resources?.xlsx ? Object.values(resources?.xlsx) : [""],
        }}
        style={{ width: "100%", textAlign: "center" }}
        layout="vertical"
        onFinish={(values) => {
          const transformedData = {
            resources: {
              xlsx: values.xlsx.reduce((acc, value, index) => {
                acc[`WORK_BOOK_${index + 1}`] = value;
                return acc;
              }, {}),
            },
          };
          handleUpdateResources(transformedData.resources);

          console.log("Submitted Values:", transformedData);
        }}
      >
        <div
          style={{
            border: "1px solid #d9d9d9",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "16px",
            backgroundColor: "#fafafa",
          }}
        >
          <Text
            strong
            style={{
              width: "100px",
              display: "flex",
              marginRight: "8px",
            }}
          >
            Xlsx:
          </Text>
          <Form.List name="xlsx">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Form.Item key={field.key} style={{ width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Text
                        strong
                        style={{
                          width: "15%",
                        }}
                      >
                        WORK_BOOK_{index + 1}:
                      </Text>
                      <Form.Item
                        {...{
                          name: field.name,
                          fieldKey: field.fieldKey,
                          validateTrigger: ["onChange", "onBlur"],
                          noStyle: true,
                        }}
                      >
                        <Input placeholder="  " style={{ flex: 1 }} />
                      </Form.Item>
                      {fields.length > 1 && (
                        <MinusCircleOutlined
                          style={{
                            fontSize: "16px",
                            color: "red",
                            marginLeft: "8px",
                          }}
                          onClick={() => remove(field.name)}
                        />
                      )}
                    </div>
                  </Form.Item>
                ))}
                <Form.Item>
                  <div
                    style={{
                      width: "85%",
                      marginLeft: "15%",
                    }}
                  >
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      style={{ width: "100%" }}
                      icon={<PlusOutlined />}
                    >
                      Add Workbook
                    </Button>
                  </div>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Text strong style={{ width: "7%", marginRight: "8px" }}>
                Variable:
              </Text>
              <Form.Item noStyle>
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    width: "100%",
                  }}
                >
                  <Input
                    placeholder="Enter output artifact"
                    style={{ width: "50%" }}
                  />
                  <Input
                    placeholder="Enter output artifact"
                    style={{ width: "50%" }}
                  />
                </div>
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ marginTop: "16px", width: "100%" }}
            >
              Save
            </Button>
          </Form.Item>
        </div>
      </Form>

      <Table
        dataSource={stages}
        columns={columns}
        rowKey="key"
        bordered
        pagination={false}
      />
    </div>
  );
}

export default TableComponent;
