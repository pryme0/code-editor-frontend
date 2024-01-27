import React from "react";
import styled, { keyframes } from "styled-components";

export const Spinner = ({
  width,
  height,
  borderWidth,
}: {
  width?: string;
  height?: string;
  borderWidth?: string;
}) => {
  return (
    <SpinnerContainer height={height} width={width} borderWidth={borderWidth} />
  );
};

const spinAnimation = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export interface SpinnerProps {
  width?: string;
  height?: string;
  borderWidth?: string;
}

const SpinnerContainer = styled.div<SpinnerProps>`
  display: inline-block;
  width: ${(props) => props.width || "20px"};
  height: ${(props) => props.height || "20px"};
  border: ${(props) => props.borderWidth || "3px"} solid #f3f3f3;
  border-top: ${(props) => props.borderWidth || "3px"} solid #3498db;
  border-radius: 50%;
  animation: ${spinAnimation} 0.8s linear infinite;
`;
