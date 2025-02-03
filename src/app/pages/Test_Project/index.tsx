import { useState } from "react";
import TableComponent from "./Component";
import { allFields, configFieldsMap } from "../../../constants/testProject";
import { Form } from "antd";

const TestProject = () => {
  const [stages, setStages] = useState([
    {
      key: 1,
      name: "",
      type: "",
      artifactKey: { inputArtifact: "", outputArtifact: "" },
      config: {},
      isSave: 0,
    },
  ]);

  const [resources, setResources] = useState<any>();
  const [editingKey, setEditingKey] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [savedConfigs, setSavedConfigs] = useState({});
  const [listOutputArtifact, setListOutputArtifact] = useState([]);

  const handleUpdateResources = (newResources: any) => {
    setResources(newResources);
  };

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
            const formattedStages = jsonData.stages.map((stage, index) => {
              const formattedStage = {
                key: index + 1,
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
                artifactKey: {
                  outputArtifact: stage.outputArtifactKey || null,
                  inputArtifact: stage.inputArtifactKey || null,
                },
                isSave: 1,
              };

              if (formattedStage.artifactKey.outputArtifact) {
                handleSave(formattedStage);
              }

              return formattedStage;
            });

            setStages(formattedStages);
            setEditingKey(null);
          }
          if (jsonData.resources) {
            const formattedResources = Object.keys(jsonData.resources).reduce(
              (acc, resourceType) => {
                acc[resourceType] = Object.keys(
                  jsonData.resources[resourceType]
                ).reduce((resourceAcc, resourceKey) => {
                  resourceAcc[resourceKey] =
                    jsonData.resources[resourceType][resourceKey];
                  return resourceAcc;
                }, {});
                return acc;
              },
              {}
            );
            setResources(formattedResources);
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
        name: " ",
        type: "",
        artifactKey: { inputArtifact: "", outputArtifact: " " },
        config: "",
        isSave: 0,
      },
    ]);
    setEditingKey(1);
  };

  const handleAddStage = (index) => {
    if (editingKey !== null) return;
    const newStage = {
      key: index + 1,
      name: "",
      type: "",
      artifactKey: { inputArtifact: "", outputArtifact: "" },
      config: "",
      isSave: 0,
    };

    const updatedStages = [...stages];
    updatedStages.splice(index, 0, newStage);

    const updatedStagesWithSteps = updatedStages.map((stage, idx) => ({
      ...stage,
      key: idx + 1,
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
            return {
              ...stage,
              [field]: value,
              config: restoredConfig,
              name: handleConfigName(value)?.name,
            };
          }

          if (field === "config") {
            const newConfig = {
              ...(typeof stage.config === "object" && stage.config
                ? stage.config
                : {}),
              ...(typeof value === "object" && value ? value : {}),
            };
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

    setStages((prevStages) =>
      prevStages.map((stage) =>
        stage.key === record.key ? { ...stage, isSave: 1 } : stage
      )
    );

    if (editingKey !== null) {
      setEditingKey(null);
      setOriginalData(null);
      setSavedConfigs({});
    }
  };

  const handleCancel = () => {
    if (editingKey !== null) {
      const isNewStageEmpty = stages.some(
        (stage) => stage.key === editingKey && !stage.isSave
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
      const editingKey = editingStage ? editingStage.key : null;

      return prevStages
        .filter((stage) => stage.key !== key)
        .map((stage) => ({
          ...stage,
          key: stage.key > editingKey ? stage.key - 1 : stage.key,
        }));
    });
  };

  const handleInputRange = (record) => {
    const ranges = ["fromRange", "toRange"];
    const suffixes = ["from", "fromIndex", "to", "toIndex"];
    const dataList = {};
    for (const range of ranges) {
      for (const suffix of suffixes) {
        const key = `${range}_${suffix}`;
        if (record?.config?.[key] !== undefined) {
          dataList[key] = record.config[key] || "";
        }
      }
    }

    const createRender = (range, from, to) => {
      const fromIndex = dataList[`${range}_fromIndex`];
      const toIndex = dataList[`${range}_toIndex`];
      const fromOutput =
        fromIndex !== undefined
          ? from
            ? `${from}{inputArtifact[${fromIndex}]['output'] + 1}`
            : `{inputArtifact[${fromIndex}]['output'] + 1}`
          : from || "";

      const toOutput =
        toIndex !== undefined
          ? to
            ? `: ${to}{inputArtifact[${toIndex}]['output']}`
            : `{inputArtifact[${toIndex}]['output']}`
          : to
            ? `: ${to}`
            : "";
      if (!fromOutput && !toOutput) {
        return record.config?.[`$${range}`];
      }

      return `${fromOutput}${toOutput}`;
    };

    setStages((prevStages) => {
      const updatedStages = prevStages.map((stage) => {
        const fromRangeFrom = stage.config?.[`fromRange_from`] || "";
        const fromRangeTo = stage.config?.[`fromRange_to`] || "";
        const toRangeFrom = stage.config?.[`toRange_from`] || "";
        const toRangeTo = stage.config?.[`toRange_to`] || "";
        const $fromRenderData = createRender(
          "fromRange",
          fromRangeFrom,
          fromRangeTo
        );
        const $toRenderData = createRender("toRange", toRangeFrom, toRangeTo);
        if (stage.key === record.key) {
          return {
            ...stage,
            config: {
              ...stage.config,
              data$fromRange: $fromRenderData || "",
              data$toRange: $toRenderData || "",
            },
          };
        }

        return stage;
      });

      return updatedStages;
    });
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

  const handleExport = (input) => {
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

    const formattedStages = data.map((stage) => {
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

  return (
    <TableComponent
      stages={stages}
      resources={resources}
      editingKey={editingKey}
      configFieldsMap={configFieldsMap}
      listOutputArtifact={listOutputArtifact}
      handleUpdateResources={handleUpdateResources}
      handleNewStage={handleNewStage}
      handleAddStage={handleAddStage}
      handleUpdateStage={handleUpdateStage}
      handleDeleteStage={handleDeleteStage}
      handleEdit={handleEdit}
      handleSave={handleSave}
      handleCancel={handleCancel}
      handleUpload={handleUpload}
      handleExport={handleExport}
      handleConfigName={handleConfigName}
      handleInputRange={handleInputRange}
      handleOutputArtifact={handleOutputArtifact}
    />
  );
};

export default TestProject;
