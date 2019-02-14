import React, { Component, Fragment } from "react";
import SearchArtist from "./components/SearchArtist";
import ArtistDetails from "./components/ArtistDetails";
import ArtistEvents from "./components/ArtistEvents";
import axios from "axios";
import moment from "moment";

class App extends Component {
  constructor(props) {
    super(props);
    let artistData = null
    if (localStorage.getItem("artistDetails")) {
      artistData = JSON.parse((localStorage.getItem("artistDetails")))
    }
    this.state = {
      name: artistData ? artistData.name : null,
      artistDetails: artistData ? artistData.artistDetails : null,
      artistEvents: artistData ? artistData.artistEvents : null,
      selectedDay: null,
      loading: false
    };
  }

  getUser = event => {
    const { name, selectedDay, loading, artistEvents } = this.state
    event.preventDefault();
    let artistDetails = null;
    this.setState({ loading: true, selectedDay: null }, () => {
      axios
        .get(
          `https://rest.bandsintown.com/artists/${
          name
          }?app_id=09f313e072cd1b192f200fb70df19ea5`
        )
        .then(response => {
          console.log(response)
          artistDetails = response.data;
          return axios.get(
            `https://rest.bandsintown.com/artists/${
            name
            }/events?app_id=09f313e072cd1b192f200fb70df19ea5`
          );
        })
        .then(response => {
          this.setState(
            {
              artistDetails,
              artistEvents: response.data,
              loading: false
            },
            () => {
              localStorage.setItem('artistDetails', JSON.stringify({
                artistDetails,
                artistEvents: this.state.artistEvents,
                name: name
              }));
            }
          );
        });
    })
  };

  handleSearch = event => {
    this.setState({ name: event.target.value });
  };

  handleDayClick = day => {
    this.setState(prevState => ({
      selectedDay: day || prevState.selectedDay
    }));
  };

  handleAllEventsClick = e => {
    e.preventDefault();
    this.setState({
      selectedDay: null
    });
  };

  render() {
    const { selectedDay, artistEvents, name, artistDetails, loading} = this.state;
    const events = selectedDay
      ? artistEvents.filter(item => {
        if (
          moment(item.datetime).format("YYYY-MM-DD") ===
          moment(selectedDay).format("YYYY-MM-DD")
        ) {
          return item;
        }
      })
      : artistEvents;
      console.log(events, artistEvents, artistDetails, loading)
    return (
      <div className="App">
        <SearchArtist handleSearch={this.handleSearch} name={name} getUser={this.getUser} />
        {!loading ? 
           artistDetails ? <Fragment>
            <ArtistDetails
              details={artistDetails}
              events={artistEvents}
              onDayClick={this.handleDayClick}
              selectedDay={selectedDay}
              onAllEventsClick={this.handleAllEventsClick}
            />
            <ArtistEvents
              events={events}
              selectedDay={
                selectedDay &&
                moment(selectedDay).format("MMM DD")
              }
            />
          </Fragment> : name && <p>Now Artist found</p>
          : <div className="loader" />
        }
      </div>
    );
  }
}

export default App;
