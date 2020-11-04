import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { getUserById } from "./database";
import { event } from "./event-routes";

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

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  //@ts-ignore
  if (req.isAuthenticated()) {
    return next();
  }
  /* istanbul ignore next */
  res.status(401).send({
    error: "Unauthorized",
  });
};

export const validateMiddleware = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation: any) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(422).json({ errors: errors.array() });
  };
};
//@ts-ignore
export function AdminValidation(req: Request, res: Response, next: NextFunction) {
  //@ts-ignore
  const userId = req.session!.passport.user;
  const user = getUserById(userId);

  if (user.isAdmin) {
    next();
  } else {
    res.status(401).send({
      error: "Unauthorized",
    });
  }
}

export function groupBy(collection: any[], property: string) {
  let i = 0;
  let values = [];
  let result = [];
  let val;
  let index;
  for (; i < collection.length; i++) {
    val = collection[i][property];
    index = values.indexOf(val);
    if (index > -1) result[index].push(collection[i]);
    else {
      values.push(val);
      result.push([collection[i]]);
    }
  }
  return result;
}

export function dataOrUnixToString(date: Date | number) {
  if (typeof date === "number") {
    const dateTypeDate = new Date(date);
    let dd = String(dateTypeDate.getDate()).padStart(2, "0");
    let mm = String(dateTypeDate.getMonth() + 1).padStart(2, "0");
    let yyyy = dateTypeDate.getFullYear();
    return dd + "/" + mm + "/" + yyyy;
  } else {
    let dd = String(date.getDate()).padStart(2, "0");
    let mm = String(date.getMonth() + 1).padStart(2, "0");
    let yyyy = date.getFullYear();
    return dd + "/" + mm + "/" + yyyy;
  }
}

export function createArrayWeekAgo(offset: number) {
  const currentDate = new Date();
  let firstDay: Date = new Date(currentDate.setDate(currentDate.getDate() - (6 + offset)));
  let array = [{ date: dataOrUnixToString(firstDay), count: 0 }];
  for (let i = 0; i < 6; i++) {
    array.push({
      date: dataOrUnixToString(new Date(currentDate.setDate(currentDate.getDate() + 1))),
      count: 0,
    });
  }
  const day: number = new Date(firstDay).getDate();
  const month: number = new Date(firstDay).getMonth() + 1;
  const year: number = new Date(firstDay).getFullYear();
  const firstDayUnix = new Date(`${year}/${month}/${day}`).valueOf();
  return { arrayOfDates: array, firstDay: firstDay, firstDayUnix: firstDayUnix };
}
export function diffrenceInDays(date1: Date, date2: Date): number {
  const date3 = new Date(date1.toISOString().substring(0, 10));
  const date4 = new Date(date2.toISOString().substring(0, 10));
  const diffTime = date4.getTime() - date3.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function createArrayByHours() {
  let array = [];
  for (let i = 0; i < 24; i++) {
    if (i < 10) {
      const obj = { hour: `0${i}:00`, count: 0 };
      array.push(obj);
    } else {
      const obj = { hour: `${i}:00`, count: 0 };
      array.push(obj);
    }
  }
  return array;
}

export const toStartOfTheDay = (date: number): number => {
  return new Date(new Date(date).toDateString()).valueOf();
};

export const convertDaysToMilisecinds = (days: number) => days * 24 * 60 * 60 * 1000;

export const getSingedUsers = (startingDateInNumber: number, events: event[]): string[] => {
  return events
    .filter(
      (event) =>
        startingDateInNumber + convertDaysToMilisecinds(7) > event.date &&
        event.date > startingDateInNumber &&
        event.name === "signup"
    )
    .map((user: event): string => user.distinct_user_id);
};

export const getOneWeekRetentions = (
  startDate: number,
  users: string[],
  weekNumber: number,
  events: event[]
): weeklyRetentionObject => {
  let weeklyRetentionObject: Omit<weeklyRetentionObject, "weeklyRetention"> = {
    registrationWeek: weekNumber,
    start: dataOrUnixToString(startDate),
    end: dataOrUnixToString(startDate + convertDaysToMilisecinds(7)),
    newUsers: getSingedUsers(startDate, events).length,
  };
  const weeklyRetention = [100];
  let currentDateCheck: number = startDate + convertDaysToMilisecinds(7);
  while (true) {
    if (currentDateCheck > toStartOfTheDay(new Date().valueOf()) + convertDaysToMilisecinds(1)) {
      break;
    }
    let countUserRetention = 0;
    const usersEvents: string[] = events
      .filter(
        (event) =>
          currentDateCheck + convertDaysToMilisecinds(7) > event.date &&
          event.date >= currentDateCheck &&
          event.name === "login"
      )
      .map((user: event): string => user.distinct_user_id);
    const setUsersArr: string[] = Array.from(new Set(usersEvents));
    for (let user of setUsersArr) {
      if (users.findIndex((userToCheck) => userToCheck === user) !== -1) {
        countUserRetention++;
      }
    }

    weeklyRetention.push(Math.round((countUserRetention * 100) / users.length));

    currentDateCheck += convertDaysToMilisecinds(7);
  }
  return { ...weeklyRetentionObject, weeklyRetention };
};
