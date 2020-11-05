import React, { useEffect, useState } from "react";
import axios from "axios";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Event, Filter } from "../../models/event";
import Button from "@material-ui/core/Button";
import { blue } from "@material-ui/core/colors";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import CircularProgress from "@material-ui/core/CircularProgress";
import LinearProgress from "@material-ui/core/LinearProgress";
import { Title, MyTextArea, MyFormControl } from "./styledComponent";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    accordings: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: "20px",
    },
    according: {
      width: "80%",
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
    button: {
      display: "flex",
      alignItems: "center",
    },
    wrapper: {
      margin: theme.spacing(1),
      position: "relative",
    },
    buttonSuccess: {
      backgroundColor: blue[500],
      "&:hover": {
        backgroundColor: blue[700],
      },
    },
    buttonProgress: {
      color: blue[500],
      position: "absolute",
      top: "50%",
      left: "50%",
      marginTop: -12,
      marginLeft: -12,
    },
    linearLoading: {
      width: "100%",
      "& > * + *": {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
      },
    },
  })
);

const AllEvents: React.FC = () => {
  const classes = useStyles();
  const [allEvents, setEvents] = useState<{ events: Event[]; more: boolean }>();
  const [offset, setOffset] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [linearLoading, setLinearLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("none");
  const [type, setType] = useState("all");
  const [browser, setBrowser] = useState("all");

  useEffect(() => {
    (async (): Promise<void> => {
      try {
        const params: Filter = {
          offset: offset,
          search: search === "" ? undefined : search,
          sorting: sort === "none" ? undefined : sort,
          type: type === "all" ? undefined : type,
          browser: browser === "all" ? undefined : browser,
        };
        const { data } = await axios.get(`http://localhost:3001/events/all-filtered`, {
          params,
        });
        setEvents(data);
        loading && setLoading(false);
        linearLoading && setLinearLoading(false);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [offset, search, sort, type, browser]);

  const handleButtonClick = async () => {
    if (!loading) {
      setLoading(true);
      setOffset((prev) => prev + 10);
    }
  };

  const handleChange = (input: string) => (e: any): void => {
    switch (input) {
      case "search":
        setLinearLoading(true);
        setSearch(e.target.value);
        break;
      case "sort":
        setLinearLoading(true);
        setSort(e.target.value);
        break;
      case "type":
        setLinearLoading(true);
        setType(e.target.value);
        break;
      case "browser":
        setLinearLoading(true);
        setBrowser(e.target.value);
        break;
      default:
        break;
    }
  };
  return (
    <>
      <Title>All Events</Title>
      <MyTextArea
        id="outlined-basic"
        label="Search"
        variant="outlined"
        onChange={handleChange("search")}
      />
      <MyFormControl>
        <InputLabel>Sort</InputLabel>
        <Select value={sort} onChange={handleChange("sort")} displayEmpty>
          <MenuItem value="none">
            <em>None</em>
          </MenuItem>
          <MenuItem value="+date">+date</MenuItem>
          <MenuItem value="-date">-date</MenuItem>
        </Select>
      </MyFormControl>
      <MyFormControl>
        <InputLabel>Type</InputLabel>
        <Select value={type} onChange={handleChange("type")} displayEmpty>
          <MenuItem value="all">
            <em>All</em>
          </MenuItem>
          <MenuItem value="login">login</MenuItem>
          <MenuItem value="signup">signup</MenuItem>
          <MenuItem value="admin">admin</MenuItem>
          <MenuItem value="/">/</MenuItem>
        </Select>
      </MyFormControl>
      <MyFormControl>
        <InputLabel>Browser</InputLabel>
        <Select value={browser} onChange={handleChange("browser")} displayEmpty>
          <MenuItem value="all">
            <em>All</em>
          </MenuItem>
          <MenuItem value="chrome">chrome</MenuItem>
          <MenuItem value="safari">safari</MenuItem>
          <MenuItem value="edge">edge</MenuItem>
          <MenuItem value="firefox">firefox</MenuItem>
          <MenuItem value="ie">ie</MenuItem>
          <MenuItem value="other">other</MenuItem>
        </Select>
      </MyFormControl>
      {linearLoading && (
        <div className={classes.linearLoading}>
          <LinearProgress />
        </div>
      )}
      {allEvents ? (
        <>
          <div className={classes.accordings}>
            {allEvents.events.map((event) => {
              return (
                <Accordion key={event._id} className={classes.according}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography className={classes.heading}>
                      {event.distinct_user_id}
                      {"     "}
                      {event.name}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada
                      lacus ex, sit amet blandit leo lobortis eget.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </div>
          {allEvents.more && (
            <div className={classes.button}>
              <div className={classes.wrapper}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  onClick={handleButtonClick}
                >
                  More events
                </Button>
                {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
              </div>
            </div>
          )}
        </>
      ) : (
        <div>loading</div>
      )}
    </>
  );
};

export default AllEvents;
