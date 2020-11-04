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

import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
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
  })
);

const AllEvents: React.FC = () => {
  const classes = useStyles();
  const [allEvents, setEvents] = useState<{ events: Event[]; more: boolean }>();
  const [offset, setOffset] = useState<number>(10);
  const [loading, setLoading] = React.useState(false);
  console.log(allEvents);
  const timer = React.useRef<number>();
  useEffect(() => {
    (async (): Promise<void> => {
      try {
        const { data } = await axios.get(`http://localhost:3001/events/all-filtered`, {
          params: { offset: offset },
        });
        setEvents(data);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [offset]);

  const getUser = async (userId: string) => {
    try {
      const { data } = await axios.get(`http://localhost:3001/users/${userId}`);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleButtonClick = async () => {
    if (!loading) {
      setLoading(true);
      try {
        const { data } = await axios.get(`http://localhost:3001/events/all-filtered`, {
          params: { offset: offset + 10 },
        });
        timer.current = window.setTimeout(() => {
          setEvents(data);
          setLoading(false);
          setOffset((prev) => prev + 10);
        }, 2000);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <>
      <h2>All Events</h2>
      {allEvents ? (
        <div className={classes.root}>
          {allEvents.events.map((event) => {
            return (
              <Accordion key={event._id}>
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
      ) : (
        <div>loading</div>
      )}
      <div className={classes.button}>
        <div className={classes.wrapper}>
          <Button
            variant="contained"
            color="primary"
            disabled={loading}
            onClick={handleButtonClick}
          >
            Accept terms
          </Button>
          {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
        </div>
      </div>
    </>
  );
};

export default AllEvents;
