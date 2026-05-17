"use node";
import { action } from "./_generated/server";
import Parser from "rss-parser";
export const testRss = action({
  args: {},
  handler: async (ctx) => {
    const parser = new Parser();
    return "ok";
  }
});