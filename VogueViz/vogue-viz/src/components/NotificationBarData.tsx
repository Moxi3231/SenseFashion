"use client";
import { useState } from "react";

export default class NotificationBarData{
    public showFlag:boolean;
    public setShowFlag:any;

    public data:string;
    public setData:any;

    public showTime:number;
    public setShowTime:any;

    constructor(){
        [this.showFlag,this.setShowFlag] = useState(false);
        [this.data,this.setData] = useState("Welcome to Vogue Viz");
        [this.showTime,this.setShowTime] = useState(1000);
    }
}