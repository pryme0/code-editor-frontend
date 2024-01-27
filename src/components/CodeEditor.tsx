import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import styled from "styled-components";
import axios from "axios";
import { axiosInstance } from "../axiosInstance";
import { useAuth } from "../store";
import { debounce } from "lodash";
import { Spinner } from "./Spinner";
import { StyledButtonProps } from "./interfaces";



const languageOptions = [
  {
    id: 94,
    value: "typescript",
    extension: "ts",
  },
  {
    id: 71,
    value: "python",
    extension: "py",
  },
];

export const CodeEditor = () => {
  const { user } = useAuth();

  const [folders, setFolders] = useState([
    {
      id: 1,
      name: "Folder 1",
      tabs: [
        {
          id: 1,
          name: "File1",
          extension: languageOptions[0].extension,
          content: 'console.log("Hello, World!");',
          language: languageOptions[0].value,
          languageId: languageOptions[0].id,
        },
      ],
    },
  ]);

  const [activeTab, setActiveTab] = useState<number>(1);
  const [activeFolder, setActiveFolder] = useState<number>(0);

  const [compiledCode, setCompiledCode] = useState<string | null>(null);
  const [compilingCode, setCompilingCode] = useState(false);

  const getFolders = async () => {
    try {
      const response = await axiosInstance.get("/folders");

      setFolders(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const options = {
    minimap: {
      enabled: false,
      theme: "vs-dark",
    },
  };
  const handleEditorChange = async (tabId: number, value: string) => {
    const currenFolder = folders[activeFolder];
    debouncedUpdateCode(tabId, value);

    setFolders((prevFolders) => {
      const updatedFolders = prevFolders.map((folder) => {
        if (folder.id === currenFolder.id) {
          return {
            ...folder,
            tabs: folder.tabs.map((tab) =>
              tab.id === tabId ? { ...tab, content: value } : tab
            ),
          };
        }
        return folder;
      });

      return updatedFolders;
    });
  };

  const debouncedUpdateCode = debounce(async (tabId: number, value: string) => {
    await axiosInstance.put(`/tabs/${tabId}`, { content: value });
  }, 100);

  const addTab = async () => {
    const newTabId = folders[activeFolder].tabs.length + 1;
    const newTab = {
      name: `File${newTabId}`,
      extension: languageOptions[0].extension,
      content: 'console.log("Hello, World!");',
      language: languageOptions[0].value,
      languageId: languageOptions[0].id,
    };

    try {
      const response = await axiosInstance.post("/tabs", {
        ...newTab,
        folderId: folders[activeFolder].id,
      });

      setFolders((prevFolders) => {
        const updatedFolders = prevFolders.map((folder) => {
          if (folder.id === activeFolder) {
            return {
              ...folder,
              tabs: [...folder.tabs, response.data],
            };
          }
          return folder;
        });
        return updatedFolders;
      });
    } catch (error) {
      console.error("Error adding tab:", error);
    }
  };
  const closeTab = (tabId: any) => {
    const currentFolder = folders[activeFolder];
    setFolders((prevFolders) => {
      const updatedFolders = prevFolders.map((folder) => {
        if (folder.id === currentFolder.id) {
          return {
            ...folder,
            tabs: folder.tabs.filter((tab) => tab.id !== tabId),
          };
        }
        return folder;
      });
      return updatedFolders;
    });
  };

  const changeTab = (tabId: any) => {
    setActiveTab(tabId);
  };

  const updateFileName = debounce(async (tabId: number, newName: string) => {
    await axiosInstance.put(`/tabs/${tabId}`, { name: newName });
    setFolders((prevFolders) => {
      const updatedFolders = prevFolders.map((folder, folderIndex) => {
        if (folderIndex === activeFolder) {
          return {
            ...folder,
            tabs: folder.tabs.map((tab) =>
              tab.id === tabId ? { ...tab, name: newName } : tab
            ),
          };
        }
        return folder;
      });
      return updatedFolders;
    });
  }, 50);

  const updateLanguage = async (tabId: number, newLanguage: string) => {
    const selectedLanguage = languageOptions.find(
      (language) => language.value === newLanguage
    );

    if (selectedLanguage) {
      try {
        await axiosInstance.put(`/tabs/${tabId}`, {
          language: newLanguage,
          extension: selectedLanguage.extension,
          languageId: selectedLanguage.id,
        });

        setFolders((prevFolders) => {
          const updatedFolders = prevFolders.map((folder, folderIndex) => {
            if (folderIndex === activeFolder) {
              return {
                ...folder,
                tabs: folder.tabs.map((tab) =>
                  tab.id === tabId
                    ? {
                        ...tab,
                        extension: selectedLanguage?.extension,
                        language: selectedLanguage?.value,
                        languageId: selectedLanguage?.id,
                      }
                    : tab
                ),
              };
            }
            return folder;
          });
          return updatedFolders;
        });
      } catch (error) {
        console.log("error updating language");

        console.log(error);
      }
    }
  };

  function handleEditorDidMount(editor: any, monaco: any) {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      "declare var require: any;"
    );
  }

  const handleRun = async (tabId: number) => {
    setCompilingCode(true);
    const tab = folders[activeFolder].tabs.find((tab) => tab.id === tabId);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_JUDGEO_URL}/submissions?wait=true`,
        {
          source_code: tab?.content,
          language_id: tab?.languageId,
        },
        {
          headers: {
            "x-rapidapi-key": process.env.REACT_APP_JUDGEO_API_KEY,
          },
        }
      );

      setCompiledCode(response.data.stdout || response.data.compile_output);
      setCompilingCode(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSetActiveFolder = (id: number) => {
    setActiveFolder(id);
  };

  const handleAddFolder = async () => {
    const folderObject = {
      name: `Folder${folders.length + 1}`,
      userid: user && user.id,
    };
    const response = await axiosInstance.post("/folders", { ...folderObject });
    delete response.data.user;
    setFolders([...folders, response.data]);
  };

  const closeFolder = (folderId: number) => {
    const updatedFolders = folders.filter((folder) => folder.id !== folderId);
    setFolders(updatedFolders);
  };

  useEffect(() => {
    getFolders();
  }, []);

  return (
    <Container>
      <FolderContainer>
        <StyledButton width="100px" onClick={handleAddFolder}>
          Add folder
        </StyledButton>
        <TabHeaderContainer>
          {folders.map((folder, index) => (
            <TabHeader key={folder.id}>
              <FolderButton
                active={index === activeFolder}
                onClick={() => handleSetActiveFolder(index)}
              >
                {folder.name}
              </FolderButton>
              <span onClick={() => closeFolder(folder.id)}>×</span>
            </TabHeader>
          ))}
        </TabHeaderContainer>
      </FolderContainer>

      <TopSectionContainer>
        <TopSectionHeader>
          <StyledButton width="100px" onClick={addTab}>
            Add tab+
          </StyledButton>
          <TabHeaderContainer>
            {folders.length > 0 &&
              folders[activeFolder].tabs.map((tab, index) => (
                <TabHeader key={tab.id}>
                  <BorderlessInput
                    onClick={() => changeTab(index)}
                    type="text"
                    value={tab.name}
                    onChange={(e) => updateFileName(tab.id, e.target.value)}
                  />
                  .{tab.extension}
                  <span onClick={() => closeTab(tab.id)}>×</span>
                </TabHeader>
              ))}
          </TabHeaderContainer>
        </TopSectionHeader>

        <TabsContainer>
          {folders.length > 0 &&
            folders[activeFolder].tabs.map((tab, index) => (
              <EditorContainer key={tab.id} active={index === activeTab}>
                <ControlContainer>
                  <StyledButton onClick={() => handleRun(tab.id)} width="100px">
                    Run
                  </StyledButton>
                  <StyledSelect
                    defaultValue={"Select language"}
                    onChange={(e) => updateLanguage(tab.id, e.target.value)}
                  >
                    {languageOptions.map((language, index) => {
                      return (
                        <option key={index} value={language.value}>
                          {language.value}
                        </option>
                      );
                    })}
                  </StyledSelect>
                </ControlContainer>

                <Editor
                  height="50vh"
                  width={"100%"}
                  theme="vs-dark"
                  language={tab.language}
                  defaultValue={tab.content}
                  onMount={handleEditorDidMount}
                  options={options}
                  onChange={(value: any, event: any) => {
                    handleEditorChange(tab.id, value);
                  }}
                />
              </EditorContainer>
            ))}
        </TabsContainer>
      </TopSectionContainer>

      <CompiledCodeContainer>
        <p> CompiledCode</p>
        {compilingCode ? (
          <Spinner />
        ) : (
          <CompiledCodeContent
            dangerouslySetInnerHTML={{
              __html:
                (compiledCode && compiledCode.replace(/\n/g, "<br>")) || "",
            }}
          />
        )}
      </CompiledCodeContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 10px;
`;

const TabsContainer = styled.div`
  display: flex;
`;

const TopSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const TopSectionHeader = styled.div`
  display: flex;
  gap: 10px;
`;

const TabHeaderContainer = styled.div`
  display: flex;
  overflow-y: scroll;
  margin-left: 20px;
  margin-bottom: 10px;
`;

const TabHeader = styled.div`
  display: flex;
  margin-right: 10px;
  align-items: center;
  gap: 5px;
  color: #fff;
  select {
    margin-left: 10px;
  }
`;

const EditorContainer = styled.div<{ active: boolean }>`
  flex: 1;
  display: ${({ active }) => (active ? "flex" : "none")};
  flex-direction: column;
  button {
    margin-bottom: 10px;
  }
`;

const CompiledCodeContainer = styled.div`
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  background-color: #060606;
  height: 30vh;
  color: #fff;
  pre {
    white-space: pre-wrap;
  }
`;

const CompiledCodeContent = styled.div`
  color: #fff;
  height: 70%;
  padding: 10px;
  overflow-x: scroll;
  border: 1px solid #333;
`;

const BorderlessInput = styled.input`
  outline: none;
  border: none;
  border-bottom: 1px solid #ccc;
  padding: 5px;
  background-color: transparent;
  width: fit-content;
  color: #ccc;

  &:focus {
    border-bottom: 1px solid #007bff; /* You can customize the focus border color */
  }
`;

const StyledSelect = styled.select`
  width: 150px;
  height: 27px;
`;

const StyledButton = styled.button<StyledButtonProps>`
  width: ${(props) => props.width || "100px"};
  color: ${(props) => props.color || "#fff"};
  background: ${(props) => props.background || "#007bff"};
  border-radius: 8px;
  border: 1px solid red;
  padding: 5px;
  gap: 5px;
  height: 27px;
`;

const FolderButton = styled.button<StyledButtonProps>`
  width: ${(props) => props.width || "100px"};
  color: ${(props) => props.color || "#fff"};
  background: ${(props) => (props.active ? "#007bff" : "#ccc")};
  border-radius: 8px;
  border: 1px solid red;
  padding: 5px;
  gap: 5px;
  height: 27px;
`;

const ControlContainer = styled.div`
  margin-top: 10px;
  display: flex;
  margin-bottom: 10px;
  gap: 10px;
`;

const FolderContainer = styled.div`
  display: flex;
`;
