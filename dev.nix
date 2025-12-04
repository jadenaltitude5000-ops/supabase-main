{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.supabase-cli
    pkgs.deno
  ];

  # This hook prevents the prompt error
  shellHook = ''
    echo "Welcome to the Supabase development environment!"
  '';
}
