// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { v4 as uuidv4 } from 'uuid'
import cuid from 'cuid'
import { nanoid } from 'nanoid'
import * as Constants from './constants'
import { copy } from './clipboard'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "unique-id-generator" is now active!'
  )

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  for (const cmd of Constants.Commands) {
    context.subscriptions.push(
      vscode.commands.registerCommand(cmd, (args: any[]) => {
        const editor = vscode.window.activeTextEditor

        generateUniqueId(cmd, editor)
      })
    )
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}

function generateUniqueId(cmd: string, editor: vscode.TextEditor | undefined) {
  if (editor === undefined || editor.selection === undefined) {
    copyUniqueId(uuidv4())
    return
  }

  const getUniqueId = () =>
    cmd === Constants.CUID_GENERATE || cmd === Constants.CUID_REPEAT
      ? cuid()
      : cmd === Constants.NANOID_GENERATE || cmd === Constants.NANOID_REPEAT
      ? nanoid()
      : uuidv4()

  let uniqueId: string = getUniqueId()

  editor.edit((editBuilder) => {
    for (const selection of editor.selections) {
      editBuilder.replace(selection, uniqueId)
      if (
        cmd === Constants.UUID_GENERATE ||
        cmd === Constants.CUID_GENERATE ||
        cmd === Constants.NANOID_GENERATE
      ) {
        uniqueId = getUniqueId()
      }
    }
  })
}

function showMessage(uniqueId: string) {
  if (isNullOrWhiteSpace(uniqueId)) {
    return
  }

  vscode.window.showInformationMessage(uniqueId)
}

function copyUniqueId(uniqueId: string) {
  copy(uniqueId, () => {
    showMessage(uniqueId + ' is copied.')
  })
}

function isNullOrWhiteSpace(text: string | null | undefined) {
  return (
    (typeof text === 'string' && !text.trim()) ||
    typeof text === undefined ||
    text === null
  )
}
