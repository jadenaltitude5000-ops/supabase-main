{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.supabase-cli
    pkgs.deno
  ];

  # This hook restores your original prompt and removes the error
  shellHook = ''
    # Source your .bashrc to get your original prompt and aliases back
    source ~/.bashrc
    echo "Welcome to the Supabase development environment!"
  '';
}
