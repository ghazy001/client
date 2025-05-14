import { useState } from "react";

interface HeaderSearchProps {
   isSearch: boolean;
   setIsSearch: (isSearch: boolean) => void;
}

const HeaderSearch = ({ isSearch, setIsSearch }: HeaderSearchProps) => {

   const [searchValue, setSearchValue] = useState("");

   const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(event.target.value);
   };

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setSearchValue('');
      setIsSearch(false);
   };

   return (
      <>

      </>
   )
}

export default HeaderSearch
