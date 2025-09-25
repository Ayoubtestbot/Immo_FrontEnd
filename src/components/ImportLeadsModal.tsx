import { useState } from 'react';
import { Modal, Button, Form, Alert, ProgressBar } from 'react-bootstrap';
import Link from 'next/link'; // Import Link

type ImportLeadsModalProps = {
  show: boolean;
  handleClose: () => void;
  onLeadsImported: () => void;
};

const ImportLeadsModal = ({ show, handleClose, onLeadsImported }: ImportLeadsModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      // Basic file type validation
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      if (!allowedTypes.includes(file.type)) {
        setError('Seuls les fichiers CSV ou Excel sont autorisés.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError('');
      setSuccess('');
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier à importer.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/leads/import', true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        setLoading(false);
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          setSuccess(`Importation réussie ! ${result.importedCount} prospects ajoutés.`);
          onLeadsImported(); // Refresh leads list
          setSelectedFile(null);
          setProgress(0);
        } else {
          const errorResult = JSON.parse(xhr.responseText);
          setError(errorResult.error || 'Échec de l\'importation.');
        }
      };

      xhr.onerror = () => {
        setLoading(false);
        setError('Erreur réseau lors de l\'importation.');
      };

      xhr.send(formData);

    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Une erreur inattendue est survenue.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Importer des prospects</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Sélectionnez un fichier CSV ou Excel</Form.Label>
            <div className="mb-2">
              <Link href="/example_leads_import.csv" passHref>
                <Button variant="link" size="sm">Télécharger un exemple de fichier CSV</Button>
              </Link>
            </div>
            <Form.Control type="file" onChange={handleFileChange} accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
          </Form.Group>
          {loading && <ProgressBar now={progress} label={`${Math.round(progress)}%`} className="mt-3" />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button variant="primary" type="submit" disabled={loading || !selectedFile}>
            {loading ? 'Importation...' : 'Importer'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ImportLeadsModal;