import React from 'react';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';
import styles from '@/styles/ModernTestimonials.module.css';

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "LeadEstate a transformé la façon dont nous gérons nos prospects. L'interface est intuitive et les fonctionnalités sont puissantes.",
      author: "Fatima Z.",
      role: "Directrice d'agence immobilière",
      rating: 5,
      avatar: "👩‍💼",
    },
    {
      quote: "Grâce à LeadEstate, nous avons considérablement amélioré notre taux de conversion. Un outil indispensable pour toute agence moderne.",
      author: "Ahmed L.",
      role: "Agent immobilier senior",
      rating: 5,
      avatar: "👨‍💼",
    },
    {
      quote: "Le support client est exceptionnel et la plateforme est constamment mise à jour avec de nouvelles fonctionnalités. Fortement recommandé !",
      author: "Sara K.",
      role: "Fondatrice d'agence",
      rating: 5,
      avatar: "👩‍🦱",
    },
  ];

  return (
    <section id="testimonials" className={styles.section}>
      <div className="modern-container">
        <div className={styles.sectionHeader}>
          <h2 className="modern-section-title">Ce que nos clients disent</h2>
          <p className="modern-section-subtitle">
            Rejoignez des centaines d'agences immobilières qui font confiance à LeadEstate
          </p>
        </div>

        <div className={styles.testimonialsGrid}>
          {testimonials.map((testimonial, index) => (
            <div
              className={styles.testimonialCard}
              key={index}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={styles.quoteIcon}>
                <FaQuoteLeft />
              </div>
              
              <div className={styles.rating}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className={styles.star} />
                ))}
              </div>

              <p className={styles.quote}>{testimonial.quote}</p>

              <div className={styles.author}>
                <div className={styles.avatar}>{testimonial.avatar}</div>
                <div>
                  <div className={styles.authorName}>{testimonial.author}</div>
                  <div className={styles.authorRole}>{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
