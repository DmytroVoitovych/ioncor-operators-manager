import { ElNotification } from "element-plus";
import { Operator } from "~/maintypes/types";

const singleDeleteNotification = (name: string) =>
  ElNotification({
    title: "Delete action",
    message: `Operator ${name} was successfully removed!`,
    type: "success",
  });

const massiveDeleteNotification = (deletedOperators: Operator[]) =>
  ElNotification({
    title: "Delete action",
    message: `Operators ${deletedOperators.map((e) => e?.name || "").join(", ")} were successfully removed!`,
    type: "success",
  });

const addNotification = (name: string) =>
  ElNotification({
    title: "Add action",
    message: `Operator ${name} was successfully added!`,
    type: "success",
  });

const updateNotification = (name: string) =>
  ElNotification({
    title: "Edit action",
    message: `Operator ${name} was successfully updated!`,
    type: "success",
  });

const saveDataNotification = () =>
  ElNotification({
    title: "Data saving",
    message: "Data is successfully synchronized with the database!",
    type: "success",
  });

const loginError = (title: string = "uknown", message: string = "no data") =>
  ElNotification({
    title,
    message,
    type: "error",
  });

export {
  singleDeleteNotification,
  massiveDeleteNotification,
  addNotification,
  updateNotification,
  saveDataNotification,
  loginError,
};
