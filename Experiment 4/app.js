const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory card collection
let cards = [
	{ id: 1, suit: 'Hearts', value: 'Ace' },
	{ id: 2, suit: 'Spades', value: 'King' },
	{ id: 3, suit: 'Diamonds', value: 'Queen' }
];

// Helper function to get next ID
function getNextId() {
	const maxId = cards.reduce((max, card) => (card.id > max ? card.id : max), 0);
	return maxId + 1;
}

// GET /cards - Retrieve all cards
app.get('/cards', (req, res) => {
	res.json(cards);
});

// GET /cards/:id - Retrieve a specific card by ID
app.get('/cards/:id', (req, res) => {
	const id = Number(req.params.id);
	const card = cards.find(c => c.id === id);
	
	if (!card) {
		return res.status(404).json({ 
			message: `Card with ID ${id} not found` 
		});
	}
	
	res.json(card);
});

// POST /cards - Add a new card
app.post('/cards', (req, res) => {
	const { suit, value } = req.body || {};
	
	// Validation
	if (!suit || !value) {
		return res.status(400).json({ 
			message: 'Both suit and value are required' 
		});
	}
	
	// Create new card
	const newCard = { 
		id: getNextId(), 
		suit, 
		value 
	};
	
	cards.push(newCard);
	res.status(201).json(newCard);
});

// DELETE /cards/:id - Delete a card by ID
app.delete('/cards/:id', (req, res) => {
	const id = Number(req.params.id);
	const index = cards.findIndex(c => c.id === id);
	
	if (index === -1) {
		return res.status(404).json({ 
			message: `Card with ID ${id} not found` 
		});
	}
	
	const [removedCard] = cards.splice(index, 1);
	res.json({ 
		message: `Card with ID ${id} removed`, 
		card: removedCard 
	});
});

// 404 handler for undefined routes
app.use((req, res) => {
	res.status(404).json({ 
		message: 'Route not found' 
	});
});

// Start server
app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});