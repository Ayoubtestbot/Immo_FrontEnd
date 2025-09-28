import React from 'react';
import styles from '@/styles/Landing.module.css';

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "LeadEstate a transformé la façon dont nous gérons nos prospects. L'interface est intuitive et les fonctionnalités sont puissantes.",
      author: "Fatima Z. - Directrice d'agence immobilière",
    },
    {
      quote: "Grâce à LeadEstate, nous avons considérablement amélioré notre taux de conversion. Un outil indispensable pour toute agence moderne.",
      author: "Ahmed L. - Agent immobilier senior",
    },
    {
      quote: "Le support client est exceptionnel et la plateforme est constamment mise à jour avec de nouvelles fonctionnalités. Fortement recommandé !",
      author: "Sara K. - Fondatrice d'agence",
    },
  ];

  return (
    <section id="testimonials" className={styles.section}>
      <h2 className={styles.sectionTitle}>Ce que nos clients disent</h2>
      <div className="d-flex flex-wrap justify-content-center">
        {testimonials.map((testimonial, index) => (
          <div className="p-4 m-2 card" style={{ flex: '1 1 300px', maxWidth: '350px' }} key={index}>
            <p className="fst-italic">\" {testimonial.quote} \"</p>
            <p className="fw-bold mt-3">- {testimonial.author}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
