///<reference path="types.ts" />

import express from "express";
import { Request, Response } from "express";

// some useful database functions in here:
import { getAllEvents, createNewEvents, getEventsUniqBySessionID } from "./database";
// import { Event, weeklyRetentionObject } from "../../client/src/models/event";
import {
  ensureAuthenticated,
  validateMiddleware,
  groupBy,
  dataOrUnixToString,
  createArrayWeekAgo,
  diffrenceInDays,
  createArrayByHours,
  toStartOfTheDay,
  convertDaysToMilisecinds,
  getOneWeekRetentions,
  getSingedUsers,
} from "./helpers";

import {
  shortIdValidation,
  searchValidation,
  userFieldsValidator,
  isUserValidator,
} from "./validators";
const router = express.Router();

// Routes

type eventName = "login" | "signup" | "admin" | "/";
type os = "windows" | "mac" | "linux" | "ios" | "android" | "other";
type browser = "chrome" | "safari" | "edge" | "firefox" | "ie" | "other";
type GeoLocation = {
  location: Location;
  accuracy: number;
};
type Location = {
  lat: number;
  lng: number;
};

export interface event {
  _id: string;
  session_id: string;
  name: eventName;
  url: string;
  distinct_user_id: string;
  date: number; // Date.prototype.getTime()
  os: os;
  browser: browser;
  geolocation: GeoLocation;
}

interface Filter {
  sorting?: string;
  type?: string;
  browser?: string;
  search?: string;
  offset?: number;
}

interface weeklyRetentionObject {
  registrationWeek: number; //launch is week 0 and so on
  newUsers: number; // how many new user have joined this week
  weeklyRetention: number[]; // for every week since, what percentage of the users came back. weeklyRetention[0] is always 100% because it's the week of registration
  start: string; //date string for the first day of the week
  end: string; //date string for the first day of the week
}
let week0Retention: weeklyRetentionObject = {
  registrationWeek: 1,
  newUsers: 34,
  weeklyRetention: [100, 24, 45, 66, 1, 80], // here we see there were 7 in total since week 1 has data for 6 weeks
  start: "01/11/2020",
  end: "07/11/2020",
};

router.get("/all", (req: Request, res: Response) => {
  const data: event[] = getAllEvents();
  res.send(data);
});

router.get("/all-filtered", (req: Request, res: Response) => {
  const filters: Filter = req.query;
  const events: any[] = getAllEvents();
  let eventsAfterFillering: event[] = [...events];
  if (filters.sorting === "+date") {
    eventsAfterFillering.sort((a, b) => a.date - b.date);
  } else {
    eventsAfterFillering.sort((a, b) => b.date - a.date);
  }
  if (filters.type) {
    eventsAfterFillering = eventsAfterFillering.filter(
      (event: event) => event.name === filters.type
    );
  }
  if (filters.browser) {
    eventsAfterFillering = eventsAfterFillering.filter(
      (event: event) => event.browser === filters.browser
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

router.get("/by-days/:offset", (req: Request, res: Response) => {
  const events: event[] = getAllEvents();
  // let eventsUniqBySessionID: event[]= getEventsUniqBySessionID(events);
  const { arrayOfDates, firstDay, firstDayUnix } = createArrayWeekAgo(parseInt(req.params.offset));
  const lastDateInString = arrayOfDates[arrayOfDates.length - 1].date;
  const dd = +lastDateInString.split("/")[0];
  const mm = +lastDateInString.split("/")[1];
  const yyyy = +lastDateInString.split("/")[2];
  const endDate = new Date(yyyy, mm - 1, dd + 1).getTime() - 1;
  let eventsUniqBySessionID = events.filter(
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

router.get("/by-hours/:offset", (req: Request, res: Response) => {
  const events: event[] = getAllEvents();
  let arrayByHours = createArrayByHours();
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
  const eventFilteredByDate: event[] = events.filter(
    (event) => event.date < endOfChoosenDay && event.date >= startOfChoosenDay
  );
  // const eventsGroupBySession: event[]= getEventsUniqBySessionID(eventFilteredByDate);
  eventFilteredByDate.forEach((event) => {
    const hourOfElement = new Date(event.date).getHours();
    arrayByHours[hourOfElement].count++;
  });
  res.send(arrayByHours);
});

router.get("/retention", (req: Request, res: Response) => {
  const dayZero: number = +req.query.dayZero;
  const events: event[] = getAllEvents();

  let startingDateInNumber: number = toStartOfTheDay(dayZero);

  const retentionsData = [];
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

// router.get('/retention', (req: Request, res: Response) => {
//   const {dayZero} = req.query
//   const firstDay=new Date(dayZero)
//   const firstDayForLast=new Date(dayZero)
//   const lastDay=new Date(firstDayForLast.setDate(firstDayForLast.getDate()+7))
//   res.send('/retention')
// });

router.post("/", (req: Request, res: Response) => {
  const newEvent: event = req.body;
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
