import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { withAuth } from '@/lib/withAuth';
import { prisma } from '@/lib/prisma';
import DashboardLayout from '@/components/DashboardLayout';
import { Button, Table, Dropdown, Alert } from 'react-bootstrap';
import AddProjectModal from '@/components/AddProjectModal';
import EditProjectModal from '@/components/EditProjectModal';
import CustomDropdownMenu from '@/components/CustomDropdownMenu';
import { Project } from '@prisma/client';

type ProjectWithCount = Project & {
  _count: {
    properties: number;
  };
};

interface ProjectsPageProps {
  projects: ProjectWithCount[];
}

const ProjectsPage = ({ projects: initialProjects }: ProjectsPageProps) => {
  const [projects, setProjects] = useState<ProjectWithCount[]>(initialProjects);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await res.json();
      setProjects(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          throw new Error('Failed to delete project');
        }
        refreshProjects();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">Gestion des Projets</h1>
        <Button onClick={() => setShowAddModal(true)} className="btn-primary">
          Ajouter un Projet
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="table-responsive-wrapper">
        <Table hover responsive>
          <thead>
            <tr>
              <th>Nom du Projet</th>
              <th>Description</th>
              <th>Pays</th>
              <th>Ville</th>
              <th>Nombre de propriétés</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>{project.name}</td>
                <td>{project.description || '-'}</td>
                <td>{project.country || '-'}</td>
                <td>{project.city || '-'}</td>
                <td>{project._count.properties}</td>
                <td>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="outline-secondary" size="sm">
                      Actions
                    </Dropdown.Toggle>
                    <CustomDropdownMenu className="dropdown-menu-fix">
                      <Dropdown.Item onClick={() => handleEditClick(project)}>Modifier</Dropdown.Item>
                      <Dropdown.Item className="text-danger" onClick={() => handleDeleteProject(project.id)}>Supprimer</Dropdown.Item>
                    </CustomDropdownMenu>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <AddProjectModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        onProjectAdded={refreshProjects}
      />

      {selectedProject && (
        <EditProjectModal
          show={showEditModal}
          handleClose={() => setShowEditModal(false)}
          project={selectedProject}
          onProjectUpdated={refreshProjects}
        />
      )}
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = withAuth(async (context, session) => {
  const agencyId = session.user.agencyId;

  if (!agencyId) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const projects = await prisma.project.findMany({
    where: {
      agencyId: agencyId,
    },
    include: {
      _count: {
        select: { properties: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    props: {
      projects: JSON.parse(JSON.stringify(projects)),
    },
  };
}, ['AGENCY_OWNER', 'AGENCY_MEMBER', 'AGENCY_SUPER_AGENT']);

export default ProjectsPage;
