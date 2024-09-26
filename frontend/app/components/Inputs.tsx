"use client"
import React, { useState } from 'react';
import './style.scss';
import '../ss.js';
import { TextField, Switch, FormControlLabel, Button, Box, Grid, Pagination, Modal, Typography } from '@mui/material';

const InputForm2 = () => {
    const [manualMode, setManualMode] = useState(false);

    return (
        <div className="container">
        <div id="words-container">
            {}
        </div>
        <div className="input-group">
            <label className="input-group__label" htmlFor="myInput">Авто</label>
            <input type="text" id="myInput" className="input-group__input" value="" />
        </div>
    </div>
    );
};

export default InputForm2;