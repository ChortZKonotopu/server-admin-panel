const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require("mongoose");
const { ObjectId } = require('mongoose').Types;

const Admin = require('./models/Admin');
const Pracownik = require('./models/Pracownik');
const Placowka = require('./models/Placowka')
const Grafik = require('./models/Grafik')


const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_CONNECTION_LINK).then(() => console.log('MongoDB connected'));

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userDoc = await Admin.findOne({ username });

    let passOk = false
    if (userDoc != null) {
        passOk = (userDoc.password == password)
    }

    if (passOk) {
        // logged in
        res.json({
            id: userDoc._id,
            username,
        });
    } else {
        console.log('wrong')
        res.status(400).json('wrong credentials');
    }
});

app.put('/addworker', async (req, res) => {
    const { imie, nazwisko, numer, urlopWN, urlopDN, urlopWZ, urlopDZ, orzeczenia, umowa, uwagi } = req.body;

    try {
        const newPracownik = await Pracownik.create({
            imie,
            nazwisko,
            numer,
            urlopWN,
            urlopDN,
            urlopWZ,
            urlopDZ,
            orzeczenia,
            umowa,
            uwagi
        });

        res.json(newPracownik);
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: 'Failed to add new worker.' });
    }
});

app.get('/workers', async (req, res) => {
    res.json(await Pracownik.find()
        .sort({ imie: 1 })
    )
})

app.delete('/deleteWorker/:id', async (req, res) => {
    const id = req.params.id
    await Pracownik.findByIdAndRemove(id).exec()
    res.send('worker succesfully deleted')
})

app.get("/findWorker/:find", async (req, res) => {
    const searchTerm = req.params.find;
    try {
        let workers;
        if (ObjectId.isValid(searchTerm)) {
            // If the searchTerm is a valid ObjectId, search by _id
            workers = await Pracownik.find({ _id: searchTerm }).sort({ imie: 1 });
        } else {
            // Search by name, surname, or phoneNumber
            workers = await Pracownik.find({
                $or: [
                    { imie: searchTerm },
                    { nazwisko: searchTerm },
                    { numer: searchTerm },
                ]
            });
        }

        res.json(workers);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to retrieve workers." });
    }
});

app.put('/updateWorker', async (req, res) => {
    const newImie = req.body.newImie;
    const newNazwisko = req.body.newNazwisko;
    const newNumer = req.body.newNumer;
    
    const urlopWN = req.body.urlopWN;
    const urlopDN = req.body.urlopDN;
    const urlopWZ = req.body.urlopWZ;
    const urlopDZ = req.body.urlopDZ;
    
    const orzeczenia = req.body.orzeczenia;
    const umowa = req.body.umowa;
    const uwagi = req.body.uwagi;
    

    const id = req.body.id;

    console.log(id)
    try {
        const PracownikToUpdate = await Pracownik.findById(id);
        if (!PracownikToUpdate) {
            return res.status(404).send("Friend not found");
        }
        PracownikToUpdate.imie = newImie;
        PracownikToUpdate.nazwisko = newNazwisko;
        PracownikToUpdate.numer = newNumer;
        
        PracownikToUpdate.urlopWN = urlopWN;
        PracownikToUpdate.urlopDN = urlopDN;
        PracownikToUpdate.urlopWZ = urlopWZ;
        PracownikToUpdate.urlopDZ = urlopDZ;
        
        PracownikToUpdate.orzeczenia = orzeczenia;
        PracownikToUpdate.umowa = umowa;
        PracownikToUpdate.uwagi = uwagi;

        await PracownikToUpdate.save();
        res.send("Updated successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error updating friend");
    }
});


//same shit with work places

app.put('/addworkPlace', async (req, res) => {
    const { name, adress } = req.body;

    try {
        const newPlacowka = await Placowka.create({
            name,
            adress,
        });

        res.json(newPlacowka);
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: 'Failed to add new worker.' });
    }
});

app.get('/workplaces', async (req, res) => {
    res.json(await Placowka.find()
        .sort({ createdAt: -1 })
    )
})

app.get("/findWorPlaces/:find", async (req, res) => {
    const searchTerm = req.params.find;
    try {
        let workPlaces;
        if (ObjectId.isValid(searchTerm)) {
            workPlaces = await Placowka.find({ _id: searchTerm });
        } else {
            workPlaces = await Placowka.find({
                $or: [
                    { name: searchTerm },
                    { adress: searchTerm },
                ]
            });
        }
        res.json(workPlaces);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to retrieve workPlaces." });
    }
});

app.delete('/deleteWorkplace/:id', async (req, res) => {
    const id = req.params.id
    console.log(id)
    await Placowka.findByIdAndRemove(id).exec()
    res.send('worker succesfully deleted')
})

app.put('/updateWorkPlace', async (req, res) => {
    const newName = req.body.newName;
    const newAdress = req.body.newAdress;
    const id = req.body.id;

    console.log(newName, newAdress)
    try {
        const PlacowkaToUpdate = await Placowka.findById(id);
        if (!PlacowkaToUpdate) {
            return res.status(404).send("Friend not found");
        }
        PlacowkaToUpdate.name = newName;
        PlacowkaToUpdate.adress = newAdress;
        await PlacowkaToUpdate.save();
        res.send("Updated successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error updating placowka");
    }
});





// Route to enter the Grafik data



app.post('/enter-grafik', async (req, res) => {
    try {
        const { placowka, date, grafikOpcji, grafik, grafikColours } = req.body;

        // Check if there is an existing Grafik with the same name and date
        const existingGrafik = await Grafik.findOne({ placowka, date });

        if (existingGrafik) {
            // If a Grafik with the same name and date already exists, return an error response.
            return res.status(409).json({ error: 'Grafik with the same name and date already exists.' });
        }

        // Create a new Grafik document
        const newGrafik = new Grafik({
            placowka,
            date,
            grafikOpcji,
            grafik,
            grafikColours
        });

        // Save the new Grafik document to the database
        await newGrafik.save();

        res.status(201).json({ message: 'Grafik data entered successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to enter Grafik data.' });
    }
});


app.get('/find-grafik', async (req, res) => {
    const placowka = req.query.placowka;
    const date = req.query.date;

    console.log(placowka, date)
    // console.log(placowka, date)

    try {
        // Find Grafik documents with the specified placowka and date
        const grafikData = await Grafik.find({ placowka, date });

        if (grafikData.length === 0) {
            // If no data is found for the specified placowka and date, return an empty array
            return res.status(404).json({ message: 'No Grafik data found for the specified placowka and date.' });
        }

        res.json(grafikData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve Grafik data.' });
    }
});

app.get('/getNumbers', async (req, res) => {
    const names = req.query.names;

    console.log(names);
    try {
        // Convert the names array into an array of search conditions
        const searchConditions = names.map(({ firstName, lastName }) => ({
            imie: firstName,
            nazwisko: lastName,
        }));

        // Use $or to find workers matching any of the search conditions
        const workers = await Pracownik.find({ $or: searchConditions });

        // Send the resulting workers as a response
        res.json(workers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch workers.' });
    }
});

app.put('/update-grafik', async (req, res) => {
    const { placowka, date, grafikOpcji, grafik, grafikColours } = req.body;

    console.log(grafik)
    try {
        // Find the existing Grafik document based on placowka and date
        const existingGrafik = await Grafik.findOne({ placowka, date });

        if (!existingGrafik) {
            // If no existing document is found, return an error
            return res.status(404).json({ error: 'Grafik not found.' });
        }

        // Update the fields with the new values
        existingGrafik.grafikOpcji = grafikOpcji;
        existingGrafik.grafikColours = grafikColours;
        existingGrafik.grafik = grafik;

        // Save the updated document to the database
        await existingGrafik.save();

        res.json({ message: 'Grafik data updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update Grafik data.' });
    }
});

app.delete('/delete-grafik', async (req, res) => {
    const { placowka, date } = req.body;

    console.log(placowka, date);
    try {
        // Find the existing Grafik document based on placowka and date
        const existingGrafik = await Grafik.findOne({ placowka, date });

        if (!existingGrafik) {
            // If no existing document is found, return an error
            return res.status(404).json({ error: 'Grafik not found.' });
        }

        // Delete the Grafik document
        await existingGrafik.deleteOne();

        res.json({ message: 'Grafik data deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete Grafik data.' });
    }
});

app.listen(4000);


