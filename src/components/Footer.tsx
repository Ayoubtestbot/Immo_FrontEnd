import React from 'react';
import styles from '@/styles/Landing.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5>LeadEstate</h5>
            <p className="text-white-50">La plateforme tout-en-un pour les agences immobilières.</p>
          </div>
          <div className="col-md-2">
            <h6>Navigation</h6>
            <ul className="list-unstyled">
              <li><a href="#services" className="text-white-50">Services</a></li>
              <li><a href="#pricing" className="text-white-50">Tarifs</a></li>
              <li><a href="#features" className="text-white-50">Fonctionnalités</a></li>
            </ul>
          </div>
          <div className="col-md-2">
            <h6>Légal</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="text-white-50">Mentions légales</a></li>
              <li><a href="#" className="text-white-50">Politique de confidentialité</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6>Contact</h6>
            <p className="text-white-50">
              Email: contact@leadestate.com <br />
              Téléphone: +33 1 23 45 67 89
            </p>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col text-center text-white-50">
            <small>&copy; {new Date().getFullYear()} LeadEstate. Tous droits réservés.</small>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
