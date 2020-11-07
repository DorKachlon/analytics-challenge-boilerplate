import React, { useState } from "react";
import { Interpreter } from "xstate";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";
import AllEvents from "../components/dashBoard/AllEvents";
import Cohort from "../components/dashBoard/Cohort";
import Map from "../components/dashBoard/Map";
import SessionsDay from "../components/dashBoard/SessionsDay";
import SessionsHours from "../components/dashBoard/SessionsHours";
import ViewSelector from "../components/dashBoard/ViewSelector";
import ErrorBoundary from "../components/dashBoard/ErrorBoundary";

import { PaperContainer, PageTitle, Display } from "../components/dashBoard/styledComponent";

export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}

const DashBoard: React.FC = () => {
  const [view, setView] = useState<string>("gallery");

  return (
    <>
      <PageTitle>this is admin area</PageTitle>
      <ViewSelector view={view} setView={setView} />
      <Display className={view}>
        <PaperContainer>
          <ErrorBoundary>
            <Map />
          </ErrorBoundary>
        </PaperContainer>
        <PaperContainer>
          <ErrorBoundary>
            <SessionsDay />
          </ErrorBoundary>
        </PaperContainer>
        <PaperContainer>
          <ErrorBoundary>
            <SessionsHours />
          </ErrorBoundary>
        </PaperContainer>
        <PaperContainer>
          <ErrorBoundary>
            <Cohort />
          </ErrorBoundary>
        </PaperContainer>
        <PaperContainer>
          <ErrorBoundary>
            <AllEvents />
          </ErrorBoundary>
        </PaperContainer>
      </Display>
    </>
  );
};

export default DashBoard;
