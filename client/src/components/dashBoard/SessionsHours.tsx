import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
} from "recharts";
import DateFnsUtils from "@date-io/date-fns";
import Snackbar from "@material-ui/core/Snackbar";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { diffrenceInDays } from "./HelpersFunction";
import { TitleAndDate, Title, MyKeyboardDatePicker } from "./styledComponent";
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const SessionsHours: React.FC = () => {
  const [dataByHours, setDataByHours] = useState([]);
  const [offset, setOffset] = useState(5);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`http://localhost:3001/events/by-hours/${offset}`);
        setDataByHours(data);
      } catch (error) {}
    })();
  }, [offset]);

  useEffect(() => {
    const optionToOffset = diffrenceInDays(new Date(), selectedDate);
    if (optionToOffset <= 0) {
      setOffset(Math.abs(optionToOffset));
    } else {
      setOffset(0);
      handleClick();
    }
  }, [selectedDate]);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };
  return (
    // <div style={{ width: "100vw", height: "80vh" }}>
    <div style={{ width: "100%", height: "450px" }}>
      <TitleAndDate>
        <Title>Sessions By Hours</Title>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <MyKeyboardDatePicker
            disableToolbar
            variant="inline"
            format="MM/dd/yyyy"
            margin="normal"
            id="date-picker-inline"
            label="Date picker inline"
            value={selectedDate}
            onChange={handleDateChange}
            KeyboardButtonProps={{
              "aria-label": "change date",
            }}
          />
        </MuiPickersUtilsProvider>
      </TitleAndDate>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={dataByHours} margin={{ top: 20, right: 80, left: 40, bottom: 0 }}>
          <Line
            name={selectedDate ? selectedDate.toDateString()! : ""}
            type="monotone"
            dataKey="count"
            stroke="red"
          />
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Legend verticalAlign="top" height={36} />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
      <div className={classes.root}>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="warning">
            You have selected a date about which we have no information!
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default SessionsHours;
