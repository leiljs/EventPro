//script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAuwHmkoeBqkEb4uCPgFzZJqBz8a1JESwM",
  authDomain: "event-man-cac3a.firebaseapp.com",
  projectId: "event-man-cac3a",
  storageBucket: "event-man-cac3a.firebasestorage.app",
  messagingSenderId: "1047043940345",
  appId: "1:1047043940345:web:a152fbcfc66a17a065a728"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    navLinks.classList.remove('active');
  });
});

document.querySelectorAll('.service-card').forEach(card => {
  observer.observe(card);
});

const filterButtons = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.getAttribute('data-filter');

    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    portfolioItems.forEach(item => {
      const category = item.getAttribute('data-category');
      if (filter === 'all' || category === filter) {
        item.style.display = 'block';
        item.style.animation = 'fadeInUp 0.5s ease';
      } else {
        item.style.display = 'none';
      }
    });
  });
});

function showMessage(text, type) {
  const bookingForm = document.querySelector('.booking-form form');
  const existing = bookingForm.querySelector('.form-message');
  if (existing) existing.remove();

  const msg = document.createElement('p');
  msg.className = 'form-message';
  msg.textContent = text;
  msg.style.cssText = `
    margin-top: 12px;
    padding: 10px 14px;
    border-radius: 5px;
    font-size: 0.95rem;
    background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
    color: ${type === 'success' ? '#155724' : '#721c24'};
    border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
  `;
  bookingForm.appendChild(msg);

  if (type === 'success') {
    setTimeout(() => msg.remove(), 5000);
  }
}
const bookingForm = document.querySelector('.booking-form form');
const submitBtn = bookingForm.querySelector('.submit-btn');

bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(bookingForm);
  const data = Object.fromEntries(formData.entries());

  if (!data.name || !data.email || !data['event-type']) {
    showMessage('Please fill in all required fields.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    await addDoc(collection(db, 'bookings'), {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      eventType: data['event-type'],
      eventDate: data['event-date'] || null,
      guests: data.guests ? parseInt(data.guests) : null,
      budget: data.budget || null,
      message: data.message || null,
      submittedAt: serverTimestamp()
    });

    await Promise.all([
      // Email to team
      emailjs.send('service_m29wau1', 'template_eezi1cf', {
        from_name:  data.name,
        from_email: data.email,
        phone:      data.phone      || 'Not provided',
        event_type: data['event-type'],
        event_date: data['event-date'] || 'Not specified',
        guests:     data.guests     || 'Not specified',
        budget:     data.budget     || 'Not specified',
        message:    data.message    || 'No additional details'
      }),
      // Confirmation email to customer
      emailjs.send('service_m29wau1', 'template_customer_confirm', {
        to_name:    data.name,
        to_email:   data.email,
        event_type: data['event-type'],
        event_date: data['event-date'] || 'To be confirmed',
        guests:     data.guests        || 'Not specified',
        budget:     data.budget        || 'Not specified'
      })
    ]);

    showMessage("Thank you! We'll be in touch within 24 hours.", 'success');
    bookingForm.reset();
  } catch (error) {
    console.error('Error:', error);
    showMessage('Something went wrong. Please try again.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  }
});