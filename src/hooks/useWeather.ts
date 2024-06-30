import axios from "axios";
import { object, string, number, InferOutput, parse } from "valibot";
import { SearchType } from "../types";
import { useMemo, useState } from "react";

//Valibot
const WeatherSchema = object({
    name: string(),
    main: object({
        temp: number(),
        temp_max: number(),
        temp_min: number(),
    })
})

export type Weather = InferOutput<typeof WeatherSchema>

export default function useWeather() {

    const [weather, setWeather] = useState<Weather>({
        name: '',
        main: {
            temp: 0,
            temp_max: 0,
            temp_min: 0
        }
    })

    const [loading, setLoading] = useState(false);

    const fetchWeather = async (search: SearchType) => {
        const appId = import.meta.env.VITE_API_KEY;
        setLoading(true)
        try {
            const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${search.city},${search.country}&appid=${appId}`
            const {data} = await axios(geoUrl)
            
            const lat = data[0].lat
            const lon = data[0].lon

            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}`

            //Valibot
            const {data: weatherResult} = await axios(weatherUrl)
            const result = parse(WeatherSchema, weatherResult )

            if(result) {
                setWeather(result)
            }
             
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    }

    const hasWeaterData = useMemo(() => weather.name, [weather])
    return {
        weather,
        loading,
        fetchWeather,
        hasWeaterData
    }
}