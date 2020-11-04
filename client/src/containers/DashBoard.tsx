import React from "react";
import { Interpreter } from "xstate";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";
import AllEvents from "../components/dashBoard/AllEvents";
import Cohort from "../components/dashBoard/Cohort";
import Map from "../components/dashBoard/Map";
import SessionsDay from "../components/dashBoard/SessionsDay";
import SessionsHours from "../components/dashBoard/SessionsHours";
import TimeUrl from "../components/dashBoard/TimeUrl";
import TimeUrlAvg from "../components/dashBoard/TimeUrlAvg";

export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}

const DashBoard: React.FC = () => {
  return (
    <div className="aaaaaa" style={{ maxWidth: "100vw" }}>
      this admin area
      <Map />
      {/* <TimeUrl/> */}
      {/* <TimeUrlAvg/> */}
      <SessionsDay />
      <SessionsHours />
      {/* <Cohort/> */}
      <AllEvents />
    </div>
  );
};

export default DashBoard;
