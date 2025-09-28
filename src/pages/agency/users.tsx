import type { GetServerSideProps } from 'next';
import { useState } from 'react';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { prisma } from '@/lib/prisma';
import type { User, UserRole } from '@prisma/client';
import { Table, Button, Dropdown } from 'react-bootstrap';
import { useRouter } from 'next/router';
import CustomDropdownMenu from '@/components/CustomDropdownMenu';
import AddUserModal from '@/components/AddUserModal';
import EditUserModal from '@/components/EditUserModal'; // New import
import { getTranslatedUserRole } from '@/utils/userRoleTranslations'; // New import
import { isTrialActive } from '@/lib/subscription';

type UserWithAgency = User & {
  agency: { name: string } | null;
};

type UsersPageProps = {
  users: UserWithAgency[];
  agencyName: string;
  isTrialActive: boolean;
};

const UsersPage = ({ users, agencyName, isTrialActive }: UsersPageProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        const res = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          throw new Error('Failed to delete user');
        }
        refreshData();
      } catch (error) {
        console.error(error);
        alert('Error deleting user');
      }
    }
  };

  return (
    <DashboardLayout>
      {!isTrialActive && (
        <Alert variant="warning">
          Votre période d\'essai a expiré. Vous ne pouvez plus ajouter de nouveaux membres. Veuillez mettre à niveau votre plan pour continuer.
        </Alert>
      )}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">Membres de l'équipe ({agencyName})</h1>
        <Button onClick={() => setShowAddModal(true)} className="btn-primary" disabled={!isTrialActive}>
          Ajouter un membre
        </Button>
      </div>

      <div className="card">
        <Table hover responsive>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name || '-'}</td>
              <td>{user.email}</td>
              <td>{getTranslatedUserRole(user.role)}</td>
              <td>
                <Dropdown align="end" popperConfig={{ strategy: 'fixed' }}>
                                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                                        Actions
                                      </Dropdown.Toggle>
                                      <CustomDropdownMenu className="dropdown-menu-fix">
                                        <Dropdown.Item onClick={() => handleOpenEditModal(user)}>Modifier</Dropdown.Item>
                                        <Dropdown.Item variant="danger" onClick={() => handleDeleteUser(user.id)}>Supprimer</Dropdown.Item>
                                      </CustomDropdownMenu>                </Dropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      </div>

      <AddUserModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        onUserAdded={refreshData}
      />

      {selectedUser && (
        <EditUserModal
          show={showEditModal}
          handleClose={() => setShowEditModal(false)}
          user={selectedUser}
          onUserUpdated={refreshData}
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
        destination: '/login', // Redirect if no agency found
        permanent: false,
      },
    };
  }

  const [users, agency, trialIsActive] = await Promise.all([
    prisma.user.findMany({
      where: {
        agencyId: agencyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.agency.findUnique({
      where: { id: agencyId },
      select: { name: true },
    }),
    isTrialActive(agencyId),
  ]);

  if (!agency) {
    return {
      redirect: {
        destination: '/login', // Redirect if agency not found
        permanent: false,
      },
    };
  }

  return {
    props: {
      users: JSON.parse(JSON.stringify(users)),
      agencyName: agency.name,
      isTrialActive: trialIsActive,
    },
  };
}, ['AGENCY_OWNER']); // Only AGENCY_OWNER can manage users

export default UsersPage;