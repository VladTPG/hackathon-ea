import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function WeatherCard({ day }) {
  return (
    <Card className="w-full h-full shadow-lg rounded-lg ">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{day.date}</CardTitle>
        <CardDescription className="capitalize text-gray-600">
          <span>Weather: {day.weatherDescription}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col content-center justify-center w-full h-full items-center gap-6 ">
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-medium text-gray-500">High</h3>
            <p className="text-xl font-semibold">{parseInt(day.temp_max)}°C</p>
          </div>
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-medium text-gray-500">Low</h3>
            <p className="text-xl font-semibold">{parseInt(day.temp_min)}°C</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
