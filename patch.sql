CREATE OR REPLACE FUNCTION check_account_workspace(p_auth_id UUID, p_acceptance_number TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
   is_valid BOOLEAN;
BEGIN
   SELECT EXISTS (
      SELECT 1 FROM app_accounts 
      WHERE auth_id = p_auth_id 
      AND (
         acceptance_hash = crypt(p_acceptance_number, acceptance_hash)
         OR acceptance_number = p_acceptance_number
      )
   ) INTO is_valid;
   RETURN is_valid;
END;
$func$;
