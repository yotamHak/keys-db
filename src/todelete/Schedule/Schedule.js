import React from "react";
import firebase from '../../firebase';
import {
  Button,
  Container,
  Grid,
  Header,
  Icon,
  Form,
  Menu,
  Label,
  Modal,
  Popup,
  List,
} from 'semantic-ui-react';
import dateFns from "date-fns";
import useFormValidation from "../../components/Authentication/useFormValidation";
import validateEvent from "../../components/Authentication/validateEvent";
import _ from "lodash"

const style = {
  gridContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh'
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  flexGrow: {
    display: 'flex',
    flexGrow: '1'
  },
  height: {
    height: '100%'
  },
  noBottomMargin: { marginBottom: '0 !important' },
  noTopMargin: { marginTop: '0 !important' },
  h1: {
    marginTop: '3em',
  },
  h2: {
    margin: '4em 0em 2em',
  },
  h3: {
    marginTop: '2em',
    padding: '2em 0em',
  },
  last: {
    marginBottom: '300px',
  },
  gridHeader: {
    display: 'block'
  },
  headerRow: {},
  gridRow: {},
  gridCell: {
    display: 'block',
    cursor: 'pointer'
  },
  disabled: {
    color: 'lightgray'
  }
}

function Schedule() {
  const INITIAL_STATE = {
    title: "",
    description: "",
    startingDate: "",
    endingDate: "",
    allDay: 0,
  }
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [scheduleDisplay, setScheduleDisplay] = React.useState("week");
  const [modalState, setModalState] = React.useState(false);
  const [events, setEvents] = React.useState([]);

  const { handleSubmit, handleChange, values, errors } = useFormValidation(INITIAL_STATE, validateEvent, handleCreateEvent);
  const eventsRef = firebase.db.collection('events')

  React.useEffect(() => {
    const unsubscribe = getEvents();
    return () => unsubscribe();
  }, []);

  function getEvents() {
    return eventsRef
      .orderBy('startingDate', 'asc')
      // .limit(LINKS_PER_PAGE)
      .onSnapshot(handleSnapshot);
  }

  function handleSnapshot(snapshot) {
    const events = snapshot.docs.map(doc => {
      return { id: doc.id, ...doc.data() }
    });

    console.log(events);
    setEvents(events);
  }

  function renderHeader(scheduleDisplay) {
    const dateFormat = "dddd";
    const days = [];
    let startDate = scheduleDisplay === "month" ? dateFns.startOfWeek(currentDate) : currentDate;

    for (let i = 0; i < 7; i++) {
      const dateIndex = dateFns.addDays(startDate, i);

      days.push(
        <Grid.Column className={`grid-cell-header`} key={i}>
          {dateFns.format(dateIndex, dateFormat)}
        </Grid.Column>
      );
    }

    return <Grid.Row className='grid-header-row' only='computer tablet'>{days}</Grid.Row>;
  }

  function openEvent(e, event) {
    e.stopPropagation();
    console.error("Need to implement")
    console.log(event);
  }

  function renderMonth() {
    const startOfMonth = dateFns.startOfMonth(currentDate);
    const endOfMonth = dateFns.endOfMonth(currentDate);
    const startingDate = dateFns.startOfWeek(startOfMonth);
    const endingDate = dateFns.endOfWeek(endOfMonth);
    let dayIndex = startingDate;
    const weeks = [];

    while (dayIndex <= endingDate) {
      let days = [];

      for (let i = 1; i <= 7; i++) {
        let date = dayIndex;
        let eventsForToday = events.filter(event => { return dateFns.isSameDay(date, event.startingDate.toDate()) });

        days.push(
          <Grid.Column
            className={
              "grid-cell"
              + (!dateFns.isSameMonth(dayIndex, startOfMonth) ? " disabled" : "")
              + (dateFns.isToday(dayIndex) ? " current-date" : "")
            }
            key={i}
            onClick={() => openEventModal(date)}
          >
            <Grid.Row className="date">
              {
                dateFns.isToday(dayIndex)
                  ? <Label basic circular color={"blue"} size={"medium"} >{dateFns.getDate(dayIndex)}</Label>
                  : dateFns.getDate(dayIndex)
              }
            </Grid.Row>
            {
              eventsForToday.length > 0 && (
                <Grid.Row>
                  <List size={'small'} className="event-list" relaxed>
                    {
                      eventsForToday.length < 4 && (
                        eventsForToday.map(event => {
                          return (
                            <List.Item key={event.id} className="event" onClick={openEvent}>
                              {event.title}
                            </List.Item>
                          )
                        })
                      )
                    }
                    {
                      eventsForToday.length > 3 && (
                        <React.Fragment>
                          {
                            eventsForToday.slice(0, 3).map(event => {
                              return (
                                <List.Item key={event.id} className="event" onClick={openEvent}>
                                  {event.title}
                                </List.Item>
                              )
                            })
                          }
                          <Popup
                            basic
                            pinned
                            position='top center'
                            on='click'
                            size={'large'}
                            trigger={<List.Item onClick={e => e.stopPropagation()}>
                              <Label basic as={"button"} size={"mini"} color={"blue"}>Show More</Label>
                            </List.Item>}
                          >
                            <List>
                              {
                                eventsForToday.map(event => {
                                  return (
                                    <List.Item key={event.id} className="event" onClick={openEvent}>
                                      {event.title}
                                    </List.Item>
                                  )
                                })
                              }
                            </List>
                          </Popup>

                        </React.Fragment>
                      )
                    }
                  </List>
                </Grid.Row>
              )
            }
          </Grid.Column>
        );

        dayIndex = dateFns.addDays(dayIndex, 1);
      }

      weeks.push(
        <Grid.Row key={dayIndex} className='grid-row'>
          {days}
        </Grid.Row>
      )

      days = [];
    }

    return weeks
  }

  function renderWeek() {
    let dayIndex = currentDate;
    const endingDate = dateFns.addDays(currentDate, 7);
    const days = [];


    while (dayIndex < endingDate) {
      const hours = [];
      let eventsForToday = events.filter(event => { return dateFns.isSameDay(dayIndex, event.startingDate.toDate()) });

      _.times(24, (i) => {
        const eventsAtHour = eventsForToday.filter(event => { return dateFns.isSameHour(event.startingDate.toDate(), dateFns.setHours(dayIndex, i)) })

        if (eventsAtHour.length > 0) {
          console.log('events for this hour', eventsAtHour)
        }

        hours.push(
          <Grid.Row key={i} className={eventsAtHour.length > 0 ? 'event grid-row' : 'grid-row'} style={{
            display: 'flex', flexGrow: '1', height: 'calc(100% / 12)', alignItems: 'center', justifyContent: 'start',
            // borderRight: '1px solid lightgray', padding: '0.5em'
          }}>
            <Grid.Column style={{ display: 'flex', flexGrow: '1', alignItems: 'center' }}>
              <div className="hour">{dateFns.format(dateFns.setHours(new Date(), i), 'HH:00')}</div>
              {
                dateFns.isSameHour(new Date(), dateFns.setHours(dayIndex, i))
                && <span className='now-indicator' style={{
                  position: 'absolute',
                  width: '100%',
                  height: '2px',
                  backgroundColor: '#ea4335',
                  left: '0',
                  top: `calc(${dateFns.getMinutes(new Date()) / 60 * 100}% )`
                }}></span>
              }
            </Grid.Column>
            {
              eventsAtHour.length > 0
              && eventsAtHour.map(event => (
                <Grid.Column style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: `calc(${dateFns.differenceInMinutes(event.endingDate.toDate(), event.startingDate.toDate()) / 60 * 100}%)`
                }}>
                  <Label size={'mini'} color={'blue'} style={{ width: '100%', height: '100%' }}>{event.title}</Label>
                </Grid.Column>
              ))
            }
          </Grid.Row >
        )
      })

      days.push(
        <Grid.Column key={dayIndex} className={'grid-column'} style={{ ...style.height }}>
          {hours}
        </Grid.Column>
      )

      dayIndex = dateFns.addDays(dayIndex, 1)
    }

    return days
  }

  function next(scheduleDisplay) { scheduleDisplay === "month" ? setCurrentDate(dateFns.addMonths(currentDate, 1)) : setCurrentDate(dateFns.addDays(currentDate, 1)) }

  function previous(scheduleDisplay) { scheduleDisplay === "month" ? setCurrentDate(dateFns.addMonths(currentDate, -1)) : setCurrentDate(dateFns.addDays(currentDate, -1)) }

  function today() { setCurrentDate(new Date()); }

  function openEventModal(date) {
    console.log(date)
    const isoFormat = "YYYY-MM-DDTHH:mm";
    const hourNow = dateFns.getHours(new Date());

    values.title = "";
    values.description = "";
    values.startingDate = dateFns.format(dateFns.addHours(date, hourNow), isoFormat);
    values.endingDate = dateFns.format(dateFns.addHours(date, hourNow + 1), isoFormat);
    values.allDay = 0;

    setModalState(true)
  }

  function handleCreateEvent() {
    const { title, description, startingDate, endingDate, allDay } = values;
    const newEvent = {
      title,
      description,
      startingDate,
      endingDate,
      allDay,
      created: Date.now(),
    }

    newEvent.startingDate = new Date(newEvent.startingDate);
    newEvent.endingDate = new Date(newEvent.endingDate);

    console.log(newEvent)

    firebase.db.collection('events').add(newEvent);
    setModalState(false)
  }

  return (
    <div style={style.gridContainer}>

      <Container>
        <Menu borderless>
          <Menu.Menu position='left'>
            <Menu.Item name='today'>
              <Button onClick={today} basic>
                Today
              </Button>
            </Menu.Item>
            <Menu.Item name='previous'>
              <Button icon onClick={() => { previous(scheduleDisplay) }} basic>
                <Icon name='left arrow' />
              </Button>
            </Menu.Item>
            <Menu.Item name='next'>
              <Button icon onClick={() => { next(scheduleDisplay) }} basic>
                <Icon name='right arrow' />
              </Button>
            </Menu.Item>
            <Menu.Item name='current month and year'>
              <Header as='h4' content={dateFns.format(currentDate, "MMMM YYYY")} />
            </Menu.Item>
          </Menu.Menu>
          <Menu.Menu position='right'>
            <Menu.Item name='signup'>
              <Button.Group basic>
                <Button onClick={() => { setCurrentDate(new Date()); setScheduleDisplay("week") }}>Week</Button>
                <Button onClick={() => { setCurrentDate(new Date()); setScheduleDisplay("month") }}>Month</Button>
              </Button.Group>
            </Menu.Item>
          </Menu.Menu>
        </Menu>
      </Container>

      <Container style={{ ...style.flexGrow, ...style.flexColumn, height: 'calc(100% - 66px)' }}>
        <Grid columns={7} textAlign='center' verticalAlign='middle' celled stackable >
          {renderHeader(scheduleDisplay)}
        </Grid>
        {
          scheduleDisplay === "month"
            ? (
              <Grid columns={7} textAlign='center' verticalAlign='middle' stackable celled
                className='monthly'
                style={{ ...style.flexGrow }}>
                {renderMonth()}
              </Grid>
            )
            : (
              <Grid columns={7} textAlign='center' verticalAlign='middle' stackable
                className='weekly'
                style={{ ...style.flexGrow, width: '100%', margin: '1em 0', boxShadow: '0 0 0 1px #d4d4d5', overflow: 'auto' }}>
                {renderWeek()}
              </Grid>
            )
        }
      </Container>

      <Modal dimmer={"blurring"} open={modalState}>
        <Modal.Header>Set an event</Modal.Header>
        <Modal.Content>
          <Form onSubmit={handleSubmit}>
            <Form.Input
              fluid
              name="title"
              label='Title'
              placeholder='Title'
              onChange={handleChange}
              value={values.title}
              autoComplete="off"
              type="text"
              error={errors.title && {
                content: errors.title,
                pointing: 'below',
              }}
            />
            <Form.Group widths='equal'>
              <Form.Field disabled={values.allDay === 1}>
                <label>Starts</label>
                <Form.Input
                  fluid
                  name="startingDate"
                  onChange={handleChange}
                  value={values.startingDate}
                  type='datetime-local'
                  error={errors.startingDate && {
                    content: errors.startingDate,
                    pointing: 'below',
                  }}
                />
              </Form.Field>
              <Form.Field disabled={values.allDay === 1}>
                <label>Ends</label>
                <Form.Input
                  fluid
                  name="endingDate"
                  onChange={handleChange}
                  value={values.endingDate}
                  type='datetime-local'
                  error={errors.endingDate && {
                    content: errors.endingDate,
                    pointing: 'below',
                  }}
                />
              </Form.Field>
            </Form.Group>
            <Form.Checkbox
              name="allDay"
              onChange={handleChange}
              value={values.allDay}
              checked={values.allDay === 1}
              type='checkbox'
              label='All day'
              onClick={() => values.allDay === 0 ? values.allDay = 1 : values.allDay = 0}
            />
            <Form.TextArea
              name="description"
              label='Description'
              placeholder='Add description...'
              onChange={handleChange}
              value={values.description}
              autoComplete="off"
              type="text"
              error={errors.description && {
                content: errors.description,
                pointing: 'below',
              }}
            />
            <Form.Group>
              <Form.Button>Save</Form.Button>
              <Form.Button onClick={(event) => { event.preventDefault(); setModalState(false); }}>Cancel</Form.Button>
            </Form.Group>
          </Form>
        </Modal.Content>
      </Modal>
    </div>
  );
}

export default Schedule;
