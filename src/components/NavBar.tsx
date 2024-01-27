import styled from "styled-components";
import { useAuth } from "../store";

export const NavBar = () => {
  const { user, logout } = useAuth();

  return (
    <NavbarContainer>
      <NavbarBrand href="/">My App</NavbarBrand>
      <NavbarLinks>
        {/* <NavbarLink href="/">Home</NavbarLink> */}

        {user ? (
          <>
            <UserInfoContainer>{user.name}</UserInfoContainer>
            <UserInfoContainer onClick={logout}>Logout</UserInfoContainer>
          </>
        ) : (
          <>
            <NavbarLink href="/signIn">signIn</NavbarLink>
            <NavbarLink href="/signUp">signUp</NavbarLink>
          </>
        )}
      </NavbarLinks>
    </NavbarContainer>
  );
};

const NavbarContainer = styled.nav`
  background-color: #060606;
  color: #fff;
  padding: 10px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #34363e;
  margin-bottom: 10px;
`;

const NavbarBrand = styled.a`
  color: #fff;
  text-decoration: none;
  font-size: 20px;
  font-weight: bold;
`;

const NavbarLinks = styled.div`
  display: flex;
  gap: 20px;
`;

const NavbarLink = styled.a`
  color: #fff;
  text-decoration: none;
  font-size: 1em;
`;

const UserInfoContainer = styled.p`
  color: #fff;
  text-decoration: none;
  font-size: 0.8em;
  cursor: pointer;
`;
