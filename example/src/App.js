import React, { Component } from 'react';

import ExampleComponent from 'react-scaling-scroll';

export default class App extends Component {
    render() {
        return (
            <div>
                <ExampleComponent
                    elements={[
                        <p key={1}>1</p>,
                        <p key={2}>2</p>,
                        <p key={3}>3</p>
                    ]}
                />
            </div>
        );
    }
}

