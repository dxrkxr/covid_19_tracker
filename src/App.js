import React, { useState, useEffect } from 'react';
import { MenuItem, FormControl, Select, Card, CardContent} from "@material-ui/core";
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import LineGraph from "./LineGraph";
import { sortData, prettyPrintStat } from "./util";
import './App.css';
import "leaflet/dist/leaflet.css";

function App() {
const [countries, setCountries] = useState([]);
const [country, setCountry] = useState('worldwide');
const [countryInfo, setCountryInfo] = useState({});
const [tableData, setTableData] = useState([]);
const [mapCenter, setMapCenter] = useState({lat : 34.80746, lng : -40.4796});
const [mapZoom, setMapZoom] = useState(3);
const [mapCountries,setmapCountries] = useState([]);
const [casesType,setCasesType] = useState("cases");

useEffect(() => {
  fetch("https://disease.sh/v3/covid-19/all")
  .then(response => response.json())
  .then(data => {
    setCountryInfo(data);
  });
},[]);

  // STATE = How to write a variable in REACT <<<

  // https://disease.sh/v3/covid-19/countries

  // useEffect = Runs a piece of code 
  // based on a given condition

  useEffect(() => {
    //The code inside here will run once (when page load)
    //async -> send a request, wait for it, do something with info

    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => ({
            name : country.country,
            value : country.countryInfo.iso2
          }));

          const sortedData = sortData(data);
          setTableData(sortedData);
          setmapCountries(data);
          setCountries(countries);
      });
    }

    getCountriesData();
  },[]);
  //when adding variable names in [] top that line, useEffect reads this and
  //use like when that variables change do that api call again

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setCountry(countryCode);

    const url = countryCode === 'worldwide' 
    ? "https://disease.sh/v3/covid-19/all" 
    : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    
    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry(countryCode);
      setCountryInfo(data);

      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
    });
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" onChange={onCountryChange} value={country}>
              {/* Loop through all the countries and show a dropdown list of the options */}

              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox isRed active={casesType==="cases"} onClick={(e) => setCasesType('cases')} title="Coronavirus Cases" cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)} />
          <InfoBox active={casesType==="recovered"} onClick={(e) => setCasesType('recovered')} title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)} />
          <InfoBox isRed active={casesType==="deaths"} onClick={(e) => setCasesType('deaths')} title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)} />
        </div>

        <Map casesType={casesType} countries={mapCountries} center={mapCenter} zoom={mapZoom} />
      </div>
      <Card className="app__right">
        <CardContent className="right_sidebar">
            <h3>Live Cases by Country</h3>
            <Table countries={tableData} />
            <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
            <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
