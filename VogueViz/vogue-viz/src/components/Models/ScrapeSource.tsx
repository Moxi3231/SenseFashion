import { Document } from "mongodb";
import { useState } from "react";

export default class ScrapeSource {
    public scrapeSourceName: String;
    public setScrapeSourceName: any;
    constructor() {
        [this.scrapeSourceName, this.setScrapeSourceName] = useState("");
    }

    private async insert() {
        try {

            const resp = await fetch('/api/addScrapeSource', {
                method: "POST", headers: {
                    "Content-Type": "application/json",
                }, body: JSON.stringify({ ScrapeSource: this.scrapeSourceName })
            }).then(res => res.json());
            if (resp.dataInsert) {
                return true;
            }
        } catch (exception) {
            console.log(exception);
        }
        return false;
    }
    private async validate() {
        try {
            const resp = await fetch('/api/validateScrapeSource', {
                method: "POST", headers: {
                    "Content-Type": "application/json",
                }, body: JSON.stringify({ ScrapeSource: this.scrapeSourceName })
            }).then(res => res.json());
            if (resp.dataFetch) {
                return !resp.isPresent;
            }
        } catch (exception) {
            console.log(exception);
        }
    }
    static async fetchScrapeSources() {
        try {
            const resp = await fetch('/api/getSrapeSources', {
                method: "POST", headers: {
                    "Content-Type": "application/json",
                }
            }).then(res => res.json());
            return resp;
        } catch (exception) {
            console.log(exception);
            return null;
        }
    }
    async validateAndInsert() {
        this.setScrapeSourceName(this.scrapeSourceName.toUpperCase());
        if (await this.validate())
            return await this.insert();
        return false;
    }
}