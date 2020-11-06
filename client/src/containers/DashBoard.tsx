import React, { useState } from "react";
import { Interpreter } from "xstate";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";
import AllEvents from "../components/dashBoard/AllEvents";
import Cohort from "../components/dashBoard/Cohort";
import Map from "../components/dashBoard/Map";
import SessionsDay from "../components/dashBoard/SessionsDay";
import SessionsHours from "../components/dashBoard/SessionsHours";
import ViewSelector from "../components/dashBoard/ViewSelector";

import { PaperContainer, PageTitle, Display } from "../components/dashBoard/styledComponent";

export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}

const DashBoard: React.FC = () => {
  const [view, setView] = useState<string>("gallery");

  return (
    <>
      <PageTitle>this admin area</PageTitle>
      <Display className={view}>
        <ViewSelector view={view} setView={setView} />
        <PaperContainer>
          <Map />
        </PaperContainer>
        <PaperContainer>
          <SessionsDay />
        </PaperContainer>
        <PaperContainer>
          <SessionsHours />
        </PaperContainer>
        <PaperContainer>
          <Cohort />
        </PaperContainer>
        <PaperContainer>
          <AllEvents />
        </PaperContainer>
      </Display>
    </>
  );
};

export default DashBoard;
