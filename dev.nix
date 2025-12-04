{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.supabase-cli,
    pkgs.deno
  ];
}
