import * as React from "react";
import styled from "styled-components";
import { CodeEditor } from "./CodeEditor";
import { NavBar } from "./NavBar";

export const AppContainer = () => {
  return (
    <Container>
      <NavBar />
      <CodeEditor />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  background: #1b1c24;
  max-width: 1200px;
  flex-direction: column;
  justify-content: center;
  margin: auto;
`;
