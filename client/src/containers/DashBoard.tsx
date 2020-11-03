import React from "react";
import { Interpreter } from "xstate";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";
import AllEvents from "../components/dashBoard/AllEvents";
import Cohort from "../components/dashBoard/Cohort";
import Map from "../components/dashBoard/Map";
import SessionsDay from "../components/dashBoard/SessionsDay";
import SessionsHoues from "../components/dashBoard/SessionsHoues";
import TimeUrl from "../components/dashBoard/TimeUrl";
import TimeUrlAvg from "../components/dashBoard/TimeUrlAvg";



export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}

const DashBoard: React.FC = () => {
  return (
    <>
    this admin area
    <Map/>
    <TimeUrl/>
    <TimeUrlAvg/>
    <SessionsDay/>
    <SessionsHoues/>
    <Cohort/>
    <AllEvents/>

    </>
  );
};

export default DashBoard;
