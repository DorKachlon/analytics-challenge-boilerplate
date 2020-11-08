///<reference path="types.ts" />

import express from "express";
import { Request, Response } from "express";

// some useful database functions in here:
import { getAllEvents, createNewEvents, getEventsUniqBySessionID } from "./database";
import { Event, weeklyRetentionObject, Filter, HourCount } from "../../client/src/models/event";
import {
  dataOrUnixToString,
  createArrayWeekAgo,
  createArrayByHours,
  toStartOfTheDay,
  convertDaysToMilisecinds,
  getOneWeekRetentions,
  getSingedUsers,
} from "./helpers";

const router = express.Router();

// Routes

router.get("/all", (req: Request, res: Response): void => {
  const data: Event[] = getAllEvents();
  res.send(data);
});

router.get("/all-filtered", (req: Request, res: Response): void => {
  const filters: Filter = req.query;
  const events: any[] = getAllEvents();
  let eventsAfterFillering: Event[] = [...events];
  if (filters.sorting === "+date") {
    eventsAfterFillering.sort((a, b) => a.date - b.date);
  } else {
    eventsAfterFillering.sort((a, b) => b.date - a.date);
  }
  if (filters.type) {
    eventsAfterFillering = eventsAfterFillering.filter(
      (event: Event) => event.name === filters.type
    );
  }
  if (filters.browser) {
    eventsAfterFillering = eventsAfterFillering.filter(
      (event: Event) => event.browser === filters.browser
    );
  }
  if (filters.search) {
    const regex: RegExp = new RegExp(filters.search, "i");
    eventsAfterFillering = eventsAfterFillering.filter((event: any) => {
      for (const key in event) {
        if (typeof event[key] === "string") {
          if (event[key].match(regex)) {
            return true;
          }
        } else if (typeof event[key] === "number") {
          if (event[key].toString().match(regex)) {
            return true;
          }
        }
      }
      return false;
    });
  }
  if (filters.offset) {
    eventsAfterFillering = eventsAfterFillering.slice(0, filters.offset);
  }
  res.json({
    events: eventsAfterFillering,
    more: !(events.length === eventsAfterFillering.length),
  });
});

router.get("/by-days/:offset", (req: Request, res: Response): void => {
  const events: Event[] = getAllEvents();
  // let eventsUniqBySessionID: event[]= getEventsUniqBySessionID(events);
  const { arrayOfDates, firstDayUnix } = createArrayWeekAgo(parseInt(req.params.offset));
  const lastDateInString: string = arrayOfDates[arrayOfDates.length - 1].date;
  const dd: number = +lastDateInString.split("/")[0];
  const mm: number = +lastDateInString.split("/")[1];
  const yyyy: number = +lastDateInString.split("/")[2];
  const endDate: number = new Date(yyyy, mm - 1, dd + 1).getTime() - 1;
  let eventsUniqBySessionID: Event[] = events.filter(
    (event) => event.date <= endDate && event.date >= firstDayUnix
  );
  const array = eventsUniqBySessionID.map((event) => {
    return { date: dataOrUnixToString(new Date(event.date)) };
  });
  for (const eventToCheck of eventsUniqBySessionID) {
    const indexChecker = arrayOfDates.findIndex(
      (day) => day.date === dataOrUnixToString(new Date(eventToCheck.date))
    );
    arrayOfDates[indexChecker].count++;
  }
  res.send(arrayOfDates);
});


router.get("/by-hours/:offset", (req: Request, res: Response): void => {
  const events: Event[] = getAllEvents();
  let arrayByHours: HourCount[] = createArrayByHours();
  const offset = parseInt(req.params.offset);
  const currentDate = new Date();
  const choosenDay = new Date(currentDate.setDate(currentDate.getDate() - offset));
  const startOfChoosenDay = new Date(
    choosenDay.getFullYear(),
    choosenDay.getMonth(),
    choosenDay.getDate()
  ).getTime();
  const endOfChoosenDay = new Date(
    choosenDay.getFullYear(),
    choosenDay.getMonth(),
    choosenDay.getDate() + 1
  ).getTime();
  const eventFilteredByDate: Event[] = events.filter(
    (event) => event.date < endOfChoosenDay && event.date >= startOfChoosenDay
  );
  // const eventsGroupBySession: event[]= getEventsUniqBySessionID(eventFilteredByDate);
  eventFilteredByDate.forEach((event) => {
    const hourOfElement = new Date(event.date).getHours();
    arrayByHours[hourOfElement].count++;
  });
  res.send(arrayByHours);
});

router.get("/retention", (req: Request, res: Response): void => {
  const dayZero: number = +req.query.dayZero;
  const events: Event[] = getAllEvents();

  let startingDateInNumber: number = toStartOfTheDay(dayZero);

  const retentionsData: weeklyRetentionObject[] = [];
  let retentionsCounter = 0;
  let numberStart = startingDateInNumber;

  while (numberStart < new Date().valueOf()) {
    if (dataOrUnixToString(numberStart).slice(-5) === "10/25") {
      numberStart += 3600 * 1000;
    }
    retentionsCounter++;
    retentionsData.push(
      getOneWeekRetentions(
        numberStart,
        getSingedUsers(numberStart, events),
        retentionsCounter,
        events
      )
    );
    numberStart += convertDaysToMilisecinds(7);
    if (dataOrUnixToString(numberStart + convertDaysToMilisecinds(7)).slice(-5) === "10/25") {
      numberStart += 3600 * 1000;
    }
  }

  res.json(retentionsData);
});

router.post("/", (req: Request, res: Response): void => {
  const newEvent: Event = req.body;
  createNewEvents(newEvent);
  res.send("SUCCESS");
});

export default router;

// router.get('/chart/os/:time',(req: Request, res: Response) => {
//   res.send('/chart/os/:time')
// })

// router.get('/chart/pageview/:time',(req: Request, res: Response) => {
//   res.send('/chart/pageview/:time')
// })

// router.get('/chart/timeonurl/:time',(req: Request, res: Response) => {
//   res.send('/chart/timeonurl/:time')
// })

// router.get('/chart/geolocation/:time',(req: Request, res: Response) => {
//   res.send('/chart/geolocation/:time')
// })

// router.get('/today', (req: Request, res: Response) => {
//   res.send('/today')
// });

// router.get('/week', (req: Request, res: Response) => {
//   res.send('/week')
// });
// router.get('/:eventId',(req : Request, res : Response) => {
//   res.send('/:eventId')
// });
