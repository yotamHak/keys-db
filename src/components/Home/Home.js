import React, { } from "react";
import { Container, Header, Segment } from "semantic-ui-react";

const Home = () => (
    <Segment
        textAlign='center'
        style={{ minHeight: 700, padding: '1em 0em' }}
        vertical
    >
        <Container text>
            <Header
                as='h1'
                content='Keys DB'
                style={{
                    fontSize: '4em',
                    fontWeight: 'normal',
                    marginBottom: 0,
                    marginTop: '3em',
                }}
            />
            <Header
                as='h2'
                content='Maintain your keys with ease and maximum safety'
                style={{
                    fontSize: '1.7em',
                    fontWeight: 'normal',
                    marginTop: '1.5em',
                }}
            />
        </Container>
    </Segment>
)

export default Home;