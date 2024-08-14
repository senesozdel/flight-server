// index.js

// Gerekli modülleri ve bağımlılıkları içe aktar
const axios = require('axios');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // .env dosyasındaki  değişkenleri yükle

const app = express();
app.use(express.json()); // JSON formatındaki istekleri ayrıştırmak için middleware ekle
app.use(cors()); // CORS ayarlarını etkinleştir

// .env değişkenlerden MongoDB bağlantı URL'sini al, yoksa yerel bağlantıyı kullan
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/flight";

// MongoDB'ye bağlan ve bağlantı durumunu kontrol et
mongoose.connect(MONGO_URL)
    .then(() => console.log('MongoDB bağlantısı başarılı'))
    .catch((err) => console.error('MongoDB bağlantı hatası:', err));

// Rezervasyon modelini içe aktar
const Reservation = require('./models/Reservation');

// Rezervasyon oluşturma endpoint'i
app.post('/api/reservations', async (req, res) => {
    try {
        // İstek gövdesinden rezervasyon bilgilerini al
        const { flightNumber, passengerName, departureTime, departureDate, airline, route, flightDirection, arrivalTime } = req.body;

        // Yeni bir rezervasyon belgesi oluştur
        const newReservation = new Reservation({
            flightNumber,
            flightDirection,
            route,
            passengerName,
            departureDate,
            departureTime,
            airline,
            arrivalTime
        });

        // Yeni rezervasyonu veritabanına kaydet
        const savedReservation = await newReservation.save();

        // Başarılı işlem sonrasında kaydedilen rezervasyon döndür
        res.status(201).json(savedReservation);
    } catch (error) {
        // Hata durumunda  hata mesajı döndür
        res.status(500).json({ message: 'Rezervasyon kaydedilemedi', error });
    }
});

// Tüm rezervasyonları getiren GET endpoint'i
app.get('/api/reservations', async (req, res) => {
    try {
        // Tüm rezervasyonları MongoDB'den çek
        const reservations = await Reservation.find();
        
        // Başarılı işlem sonrasında 200 status kodu ve rezervasyonları JSON formatında döndür
        res.status(200).json(reservations);
    } catch (error) {
        console.error('Veri çekme hatası:', error);
        // Hata durumunda 500 status kodu ve hata mesajı döndür
        res.status(500).json({ message: 'Rezervasyonlar getirilemedi', error });
    }
});

// Belirli bir rezervasyonu getiren GET endpoint'i
app.get('/api/reservations/:id', async (req, res) => {
    const { id } = req.params; // URL'den rezervasyon ID'sini al
    try {
        // ID ile rezervasyonu MongoDB'den bul
        const reservation = await Reservation.findById(id);

        // Rezervasyon bulunamazsa 404 status kodu döndür
        if (!reservation) {
            return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
        }

        // Başarılı işlem sonrasında 200 status kodu ve rezervasyonu JSON formatında döndür
        res.status(200).json(reservation);
    } catch (error) {
        console.error('Veri çekme hatası:', error);
        // Hata durumunda 500 status kodu ve hata mesajı döndür
        res.status(500).json({ message: 'Rezervasyon getirilemedi', error });
    }
});

// Schiphol API'den uçuşları getiren GET endpoint'i
app.get('/api/flights', async (req, res) => {
    const { scheduleDate, flightDirection, route } = req.query; // Query parametrelerini al
    try {
        // Schiphol API'sine istek gönder ve uçuşları al
        const response = await axios.get(process.env.SCHIPHOL_API_FLIGHTS, {
            headers: {
                'ResourceVersion': 'v4',
                'app_id': process.env.Application_ID, // Eğer gerekliyse API ID
                'app_key': process.env.Application_Keys // API Key
            },
            params: {
                scheduleDate,
                flightDirection,
                route
            }
        });

        // API'den dönen uçuş verisini al
        const flights = response.data.flights;

        // Başarılı işlem sonrasında  uçuşları JSON formatında döndür
        res.status(200).json(flights);
    } catch (error) {
        console.error('API hatası:', error);
        // Hata durumunda hata mesajı döndür
        res.status(500).json({ message: 'Uçuşlar getirilemedi', error });
    }
});

// Schiphol API'den destinasyonları getiren GET endpoint'i
app.get('/api/dest', async (req, res) => {
    try {
        // Schiphol API'sine istek gönder ve destinasyonları al
        const response = await axios.get(process.env.SCHIPHOL_API_DESTINATIONS, {
            headers: {
                'ResourceVersion': 'v4',
                'app_id': process.env.Application_ID, // Eğer gerekliyse API ID
                'app_key': process.env.Application_Keys // API Key
            }
        });

        // API'den dönen destinasyon verisini al
        const destinations = response.data.destinations;

        // Başarılı işlem sonrasında  destinasyonları JSON formatında döndür
        res.status(200).json(destinations);
    } catch (error) {
        console.error('API hatası:', error);
        // Hata durumunda hata mesajı döndür
        res.status(500).json({ message: 'Destinasyonlar getirilemedi', error });
    }
});

// Sunucuyu belirtilen PORT üzerinden başlat
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
